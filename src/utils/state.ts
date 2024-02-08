export type StateChip = {
  clientID: string
  state?: string
}

export const marshalState = (chip: StateChip): string => {
  return JSON.stringify(chip)
}

export const unmarshalState = (text: string): StateChip => {
  return JSON.parse(text)
}
