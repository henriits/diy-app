import type { Projects, Users, Comments, ProjectImages, Ratings } from '@server/shared/types'
import type { Insertable } from 'kysely'
import { Chance } from 'chance'

export const random = process.env.CI ? Chance(1) : Chance()

const generateUsername = (): string => {
  let username = ''
  // Ensure that the username is longer than 3 letters and contains only letters
  while (username.length <= 3 || !/^[A-Za-z]+$/.test(username)) {
    username = random.word() // You can replace random.word() with another function if needed
  }
  return username
}

export const fakeUser = <T extends Insertable<Users>>(overrides: Partial<T> = {} as T) => ({
  email: random.email(),
  password: 'password.123',
  username: generateUsername(),
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

export const fakeComment = <T extends Partial<Insertable<Comments>>>(overrides: T = {} as T) => ({
  content: random.sentence({ words: 3 }),
  ...overrides,
})

export const fakeImage = <T extends Partial<Insertable<ProjectImages>>>(
  overrides: T = {} as T
) => ({
  imageUrl: 'https://example.com',
  ...overrides,
})

export const fakeRating = <T extends Partial<Insertable<Ratings>>>(overrides: T = {} as T) => ({
  rating: random.integer({ min: 1, max: 5 }),
  ...overrides,
})
