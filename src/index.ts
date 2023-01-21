const CHAR_MAP_64 = `-1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_`
const RANDOM_LENGTH_BIT = 5

function charMapValue(n: number) {
  if (n > 63) throw new Error("Number must be less than 63")
  return CHAR_MAP_64[n]
}

function dateIsValid(date: unknown): boolean {
  return date instanceof Date
}

export function ctxDate(id: string) {
  const century = CHAR_MAP_64.indexOf(id[0])
  const year = CHAR_MAP_64.indexOf(id[1])
  const month = CHAR_MAP_64.indexOf(id[2])
  const day = CHAR_MAP_64.indexOf(id[3])
  const hour = CHAR_MAP_64.indexOf(id[4])
  const minute = CHAR_MAP_64.indexOf(id[5])
  const second = CHAR_MAP_64.indexOf(id[6])
  const milli1 = CHAR_MAP_64.indexOf(id[7])
  const milli2 = CHAR_MAP_64.indexOf(id[8])
  const milli3 = CHAR_MAP_64.indexOf(id[9])
  const milli = parseInt(`${milli1}${milli2}${milli3}`)

  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (hour < 0 || hour > 23) return null
  if (minute < 0 || minute > 59) return null
  if (milli < 0 || milli > 999) return null

  const test = new Date(
    `${century.toString().padStart(2, "0")}${year
    .toString()
    .padStart(2, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}:${second.toString().padStart(2, "0")}.${milli
    .toString()
    .padStart(3, "0")}Z`,
  )
  if (dateIsValid(test)) return test

  return null
}

export function parentId(id: string) {
  const parts = id.split("/")
  if (parts.length < 3) return null
  return parts.slice(0, parts.length - 2).join("/")
}

export function getSequence(id: string) {
  const parts = id.split("/")
  return parseInt(parts[parts.length - 1])
}

export function parentType(id: string) {
  const parts = id.split("/")
  if (parts.length === 3) return "namespace"
  if (parts.length < 3) return null
  return parts[parts.length - 4]
}

export function parentDate(id: string) {
  const parent = parentId(id)
  if (parent === null) return null
  const possibleDate = parent
  .match(
    /([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])([A-Za-z\d\-_])/g,
  )
  ?.pop()
  if (!possibleDate) return null
  const date = ctxDate(possibleDate)
  return dateIsValid(date) && date
}

function randomId(length: number) {
  let result = ""
  while (result.length < length) {
    result += CHAR_MAP_64[Math.floor(Math.random() * CHAR_MAP_64.length)] || "_"
  }
  return result
}

function dateToId(date: Date, version?: string) {
  const fullYear = date.getFullYear().toString()
  const century = charMapValue(parseInt(fullYear.slice(0, 2)))
  const year = charMapValue(parseInt(fullYear.slice(2, 4)))
  const month = charMapValue(date.getUTCMonth() + 1)
  const day = charMapValue(date.getUTCDate())
  const hours = charMapValue(date.getUTCHours())
  const minutes = charMapValue(date.getUTCMinutes())
  const seconds = charMapValue(date.getUTCSeconds())
  const milli = date
  .getUTCMilliseconds()
  .toString()
  .padStart(3, "0")
  .slice(0, 3)
  const milli1 = charMapValue(parseInt(milli[0]))
  const milli2 = charMapValue(parseInt(milli[1]))
  const milli3 = charMapValue(parseInt(milli[2]))
  const random = randomId(RANDOM_LENGTH_BIT)
  const id = `${century}${year}${month}${day}${hours}${minutes}${seconds}${milli1}${milli2}${milli3}${random}`

  if (version) return `${id}@${version}`
  else return id
}

export function ctxId({
                               type,
                               domain,
                               date = new Date(),
                               sequence,
                               version,
                             }: {
  type: string
  domain?: string
  date?: Date
  sequence?: number
  version?: string
}) {
  const id = sequence === undefined ? dateToId(date, version) : sequence
  return `${domain ? domain : ""}/${type}/${id}`
}
export function ctxIds(
  type: string,
  parentId: string,
  count: number,
  date = new Date(),
) {
  const ids = []
  for (let i = 0; i < count; i++) {
    ids.push(dateToId(date))
  }
  return ids.map(id => `${parentId}/${type}/${id}`)
}

export function benchmark(iterations = 1000000) {
  const start = Date.now()
  for (let i = 0; i < 1000000; i++) {
    ctxId({
      type: "log",
      domain: "acme/ticket/276HJg555P2",
    })
  }
  console.log(`created a ${iterations} ids in ${Date.now() - start}ms`)
}

export function detectCollision() {
  const iterations = 1000000
  const ids: Array<string> = []
  for (let i = 0; i < iterations; i++) {
    const id = ctxId({type: "log", domain: "acme/ticket/276HJg555P2"})
    if (ids.includes(id)) {
      break
    }
    ids.push(id)
  }
}

export function typePointer(id: string) {
  const parts = id.split("/")
  const path: Array<string> = []
  while (parts.length) {
    parts.pop() // pop id part
    const type = parts.pop()
    if (type) path.push(type)
  }
  return path.reverse().join("/")
}

export function idPointer(id: string) {
  const parts = id.split("/")
  const path: Array<string> = []
  while (parts.length) {
    let id = parts.pop() // pop id part
    parts.pop()
    if (id) path.push(id)
  }

  return path.reverse().join("/")
}

export function idType(id: string) {
  const parts = id.split("/")
  return parts[parts.length - 2]
}

export function idPart(baseId: string) {
  return baseId.split("@")[0]
}
export function versionPart(baseId: string) {
  return baseId.split("@")[1] || "latest"
}

export function inspectCtx(id: string) {
  const parts = id.split("/")
  const hasVersion = parts[parts.length - 1].includes("@")
  const isSequence = !isNaN(idPart(parts[parts.length - 1]) as any)

  const version = versionPart(parts[parts.length - 1])
  const date = isSequence
    ? ctxDate(parts[parts.length - 3])
    : ctxDate(idPart(parts[parts.length - 1])) || null
  const relativeDate = parentDate(id)
  const typePath = typePointer(id)
  const idPath = idPointer(id)
  const validLength = parts.length % 2 === 1

  const seed: Array<number> = []
  if (!isSequence)
    for (let i = id.length - RANDOM_LENGTH_BIT; i < id.length; i++) {
      seed.push(CHAR_MAP_64.indexOf(id[i]))
    }

  return {
    meta: {
      timestamp: new Date(),
      ageMs: date ? Date.now() - date.getTime() : null,
      id,
      version,
      hasVersion,
    },
    namespace: parts[0] || null,
    type: idType(id) || "namespace",
    id: parts[parts.length - 1] || null,
    isSequence,
    typePointer: typePath || null,
    idPointer: idPath || null,
    typePath: typePath.replace(/\//g, ".") || null,
    idPath: idPath.replace(/\//g, ".") || null,
    date,
    relativeDate,
    domain: parentId(id)
      ? {
        id: parentId(id),
        type: parentType(id),
      }
      : null,
    validLength,
    length: parts.length,
    seed,
  }
}

benchmark()
