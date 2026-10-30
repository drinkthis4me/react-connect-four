export type PlayerId = 'p1' | 'p2'

export type DiscColor = 'red' | 'yellow'

export interface Player {
  id: PlayerId
  name: string
  color: DiscColor
}
