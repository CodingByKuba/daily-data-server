const checkSymbols = (data, type) => {
  if(
      data.includes("<") || 
      data.includes(">") || 
      data.includes("$") || 
      data.includes("&") || 
      data.includes("(") || 
      data.includes(")") || 
      data.includes("[") || 
      data.includes("]") || 
      data.includes("{") || 
      data.includes("}") || 
      data.includes("'") || 
      data.includes('"') || 
      data.includes(":") || 
      data.includes(";") || 
      data.includes("/") || 
      data.includes("?") || 
      data.includes("!") || 
      data.includes("@") || 
      data.includes("#") || 
      data.includes("%") || 
      data.includes("^") || 
      data.includes("*") || 
      data.includes("+") || 
      data.includes("-") || 
      data.includes("=") || 
      data.includes("|") || 
      data.includes("~") || 
      data.includes("`")
  ) return false

  if(type && type === "nick" && data.includes(" ")) return false

  return true
}

module.exports = {
  checkSymbols
}