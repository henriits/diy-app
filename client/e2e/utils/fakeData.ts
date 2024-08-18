import type { Projects, Users } from '@server/shared/types'
import type { Insertable } from 'kysely'
import { Chance } from 'chance'

export const random = process.env.CI ? Chance(1) : Chance()

export const fakeUser = <T extends Insertable<Users>>(overrides: Partial<T> = {} as T) => ({
  email: random.email(),
  password: 'password.123',
  username: random.word(),
  firstName: random.first(),
  lastName: random.last(),
  ...overrides,
})

export const fakeProject = <T extends Partial<Insertable<Projects>>>(overrides: T = {} as T) => ({
  title: random.sentence({ words: 5 }),
  description: random.paragraph(),
  instruction: random.paragraph(),
  materials: random.paragraph(),
  ...overrides,
})
