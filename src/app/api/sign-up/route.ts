import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

// function name must be POST/GET like this
export async function POST(request: Request) { // Request is coming from nextjs
    await dbConnect()

    try {
        const { username, email, password } = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 400 }
            )
        }

        const existingUserByEmail = await UserModel.findOne({ email })

        // creating 6digit random otp
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: 'User Already Exists With Provided Email'
                    },
                    {
                        status: 400
                    }
                )
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hashedPassword
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

                await existingUserByEmail.save()
                // control goes to send verification mail, line: 76
            }

        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1) // we are able to modify variable of const type as it is an object not simple variable

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        // send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        // console.log(emailResponse)

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {
                    status: 500
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: 'User Registered Successfully. Please Verify Your Email'
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error('Error Registering User', error)

        return Response.json(
            {
                success: false,
                message: 'Error Registering User'
            },
            {
                status: 500
            }
        )
    }
}