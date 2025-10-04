import z from 'zod'

export const createMapSchema = z.object({
  name: z.string().min(1)
})

export type CreateMapSchema = z.infer<typeof createMapSchema>
