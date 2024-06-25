export const varname = (varmap: Record<string | number | symbol, unknown>) => {
  return Object.keys(varmap)[0]
}