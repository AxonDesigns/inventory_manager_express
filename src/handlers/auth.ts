import { UserHandler } from "@/handlers/users";
import { ValidationError } from "@/lib/errors";
import { SelectPublicExpandedUser, SelectPublicUser } from "@/types";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

export class AuthHandler {
  static login = async <T extends boolean>(email: string, password: string, expand: T): Promise<
    {
      accessToken: string,
      user: T extends true ? SelectPublicExpandedUser : SelectPublicUser
    }
  > => {
    const foundUser = await UserHandler.getOne({
      email,
      expand: expand,
      asPrivate: true,
    });

    if (!(await compare(password, foundUser.password))) {
      throw new ValidationError(["Invalid password"]);
    }

    const { password: _, verificationToken, ...rest } = foundUser;

    const accessToken = sign(rest, process.env.ACCESS_TOKEN_SECRET as string, {
      expiresIn: "1h",
    });

    return {
      accessToken,
      user: rest as unknown as T extends true ? SelectPublicExpandedUser : SelectPublicUser,
    };
  }
}