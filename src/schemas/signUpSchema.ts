import {z} from 'zod'

export const userNameValidation = z
    .string()
    .min(2, 'Username mut be atleast 2 character')
    .max(20, 'Username mut be no more than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special character')


export const signUpSchema = z.object({
    username: userNameValidation,
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(6, {message: 'Pasword must be atleast 6 characters'})
})