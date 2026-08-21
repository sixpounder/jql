import { datasource, DatasourceRepository } from "./datasource";
import { project } from "./datasource/internals";
import { AnyObject, RawDataSource, AsyncDataSource, AnyDataSource } from "./datasource/prelude";
import {
  QueryFilterProtocol,
  and,
  filter,
  identity,
  isPredicate,
  AnyFilter
} from "./filter";
import { isUndefined, filter as projectedObject } from "lodash-es";
import { SortDirection, SortRule, sort } from "./sort";
import { isNull, uniq } from "lodash-es";

export enum FilterChainType {
    Intersection,
    Union
}

/**
 * Implemented by types that can be `run`ned at some point
 */
export interface Executable<P extends string | symbol> {
    /**
     * Executes the query and return a result
     */
    run<O extends { [K in P]: any }>(): Promise<O[]>
}

/**
 * Represents a projection of some fields on a source
 */
export class Projection<TProject extends string | symbol> {
  private projectionSpec: TProject[] | null = null;

  constructor(...projectionSpec: TProject[]) {
    this.projectionSpec = projectedObject(uniq(projectionSpec), (projectionItem) => projectionItem !== "*");
  }

  /**
   * Adds a datasource for this query. This can be any javascript object, array or DOM node.
   * @param sources - Any number of data sources to include in the query
   * @returns - the query with the data source(s) added
   */
  public from<TDataSource>(...sources: AnyDataSource[]): QueryWithDataSource<TDataSource, TProject> {
    return new QueryWithDataSource<typeof sources, TProject>(this, sources);
  }

  public get projection(): TProject[] | null {
    return this.projectionSpec;
  }

  /* istanbul ignore next */
  public describe(): string {
    return JSON.stringify(this)
  }
}

/**
 * Represents a query that has data sources attached to it, and is now filterable,
 * sortable, runnable etc...
 */
export class QueryWithDataSource<TDataSource, TProject extends string | symbol> implements Executable<TProject> {
  private datasourceRepository: DatasourceRepository = new DatasourceRepository();
  private resultsLimit = 0;
  private resultsOffset = 0;
  private sortRules: SortRule[] = [];
  private _filter: QueryFilterProtocol = identity;
  private _having: QueryFilterProtocol | undefined;

  constructor(private parent: Projection<TProject>, sources: RawDataSource<unknown>[]) {
    for (const source of sources) {
      const ds = datasource(source);
      this.datasourceRepository.add(ds);
    }
  }

  /**
   * Registers filters for this query
   * @param conditions - the filters to append to the filter list
   * @returns - The query with the filters appended
   */
  public where(...conditions: AnyFilter[]): QueryWithDataSource<TDataSource, TProject> {
    if (conditions.length === 1 && isPredicate(conditions[0])) {
      this._filter = filter(conditions[0]);
    } else {
      this._filter = and(...conditions);
    }

    return this;
  }

  /**
   * Adds `having` filters for this query. They differ from `where` filters
   * in that they run on the final result before it is returned and not on the
   * whole datasource.
   * 
   * @param conditions - the filters to append
   * @returns - The query with the filters appended
   */
  public having(...conditions: AnyFilter[]): QueryWithDataSource<TDataSource, TProject> {
    if (conditions.length === 1 && isPredicate(conditions[0])) {
      this._having = filter(conditions[0]);
    } else {
      this._having = and(...conditions);
    }

    return this;
  }

  /**
   * Sets the limit of the result set size to `n`. `0` means no limit.
   * @param n - the number of entries to limit to
   * @returns - the query with a limit set
   */
  public limit(n: number): QueryWithDataSource<TDataSource, TProject> {
    this.resultsLimit = n;
    return this;
  }

  /**
   * Sets the offset of the result set to `n`.
   * @param n - the offset index
   * @returns - the query with an offset set
   */
  public offset(n: number): QueryWithDataSource<TDataSource, TProject> {
    this.resultsOffset = n;
    return this;
  }

  /**
   * Appends sort rules for this query
   * @param field - The field to sort by
   * @param direction - The direction of the sort. The default is `SortDirection.Ascending`
   */
  public orderBy(field: string, direction: SortDirection = SortDirection.Ascending)
    : QueryWithDataSource<TDataSource, TProject> {
    this.sortRules.push({
      field,
      direction
    });

    return this;
  }

  public get whereFilter(): QueryFilterProtocol {
    return this._filter;
  }

  public get havingFilter(): QueryFilterProtocol | undefined {
    return this._having;
  }

  /**
   * Executes the query
   * @returns - The result set
   */
  public async run<O extends { [K in TProject]: any }>(): Promise<O[]> {
    /* instanbul ignore next */
    if (isNull(this.datasourceRepository)) {
      throw new Error("Cannot run a query without a source. Use .from(...) to set one.");
    }

    if (isNull(this.parent.projection)) {
      throw new Error(
        "Cannot run a query without a projection. Use .select(...) or the select() builder function to set one."
      );
    }

    let unprojectedNodes: AnyObject[] = [];
    const datasources: AsyncDataSource<unknown>[] = this.datasourceRepository.merge();

    // Extraction and filtering
    for (const source of datasources) {
      for (const node of await source.entries(this.whereFilter)) {
        unprojectedNodes.push(node as AnyObject);
      }
    }

    // Sorting
    if (this.sortRules.length) {
      for (let i = 0; i < this.sortRules.length; i++) {
        unprojectedNodes = sort(unprojectedNodes, this.sortRules[i]);
      }
    }

    // Limit / offset
    if (this.resultsLimit !== 0 || this.resultsOffset !== 0) {
      unprojectedNodes = unprojectedNodes.slice(
        this.resultsOffset,
        this.resultsOffset + (this.resultsLimit === 0 ? unprojectedNodes.length - 1 : this.resultsLimit)
      );
    }

    // Projection
    const projectedNodes: O[] = unprojectedNodes.map(
      node => project(node, this.parent.projection) as O
    );

    // Having
    let filteredProjectedNodes;
    if (!isUndefined(this.havingFilter)) {
      filteredProjectedNodes = [];
      for (const element of projectedNodes) {
        if (await this.havingFilter?.apply(element)) {
          filteredProjectedNodes.push(element);
        }
      }
    } else {
      filteredProjectedNodes = projectedNodes;
    }

    return filteredProjectedNodes;
  }


}

/**
 * Create a query. This specifies what properties you want to select, just like
 * a SQL projection
 * @param projections - One or more strings identifying fields to select.
 * @returns - A `Query` to further customize
 * @example
 * ```typescript
 * select().from({ a: 1 }).run()
 * select("a").from({ a: 1 }).run()
 * ```
 */
export function select<P extends string | symbol>(...projections: P[]): Projection<P> {
  return new Projection(...projections);
}
