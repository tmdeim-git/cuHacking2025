import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useActionForm } from "@gadgetinc/react";
import { Link, useLocation, useNavigate, useOutletContext } from "react-router";
import { api } from "../api";
import type { RootOutletContext } from "../root";
import Logo from "@/assets/logo.png";

export default function () {
  const { gadgetConfig } = useOutletContext<RootOutletContext>();
  const navigate = useNavigate();
  const {
    register,
    submit,
    formState: { errors, isSubmitting },
  } = useActionForm(api.user.signIn, {
    onSuccess: () =>
      navigate(gadgetConfig.authentication!.redirectOnSuccessfulSignInPath!),
  });
  const { search } = useLocation();

  return (
    <div className="w-[85%] font-sans">
      {" "}
      {/* Added font-sans here */}
      <div className="space-y-8 flex flex-col justify-center items-center">
        <img src={Logo} className="h-48 w-48" />
        <Card className="p-8 bg-transparent border-none shadow-none">
          <form onSubmit={submit}>
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight text-center font-sans">
                {" "}
                {/* Added font-sans here */}
                Your Info
              </h1>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1 flex flex-col justify-center items-center">
                    <Label
                      htmlFor="firstName"
                      className=" text-center text-3xl font-sans" // Added font-sans here
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      {...register("firstName")}
                      className={`w-full h-16 text-3xl rounded-full font-sans ${
                        // Added font-sans here
                        errors?.user?.firstName?.message
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    {errors?.user?.firstName?.message && (
                      <p className="text-sm text-destructive font-sans">
                        {" "}
                        {/* Added font-sans here */}
                        {errors.user.firstName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1 flex flex-col justify-center items-center">
                    <Label
                      htmlFor="lastName"
                      className=" text-center text-3xl font-sans"
                    >
                      {" "}
                      {/* Added font-sans here */}
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      {...register("lastName")}
                      className={`w-full h-16 text-3xl rounded-full font-sans ${
                        // Added font-sans here
                        errors?.user?.lastName?.message
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    {errors?.user?.lastName?.message && (
                      <p className="text-sm text-destructive font-sans">
                        {" "}
                        {/* Added font-sans here */}
                        {errors.user.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1 flex flex-col justify-center items-center">
                    <Label
                      htmlFor="birthDate"
                      className=" text-center text-3xl font-sans" // Added font-sans here
                    >
                      Date of Birth
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      {...register("birthDate")}
                      className={`w-full h-16 text-3xl rounded-full font-sans ${
                        // Added font-sans here
                        errors?.user?.birthDate?.message
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    {errors?.user?.birthDate?.message && (
                      <p className="text-sm text-destructive font-sans">
                        {" "}
                        {/* Added font-sans here */}
                        {errors.user.birthDate.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full text-3xl h-16 rounded-full font-sans" // Added font-sans here
                  size="lg"
                  disabled={isSubmitting}
                  type="submit"
                >
                  Access my portal
                </Button>
                {errors?.root?.message && (
                  <p className="text-sm text-destructive font-sans">
                    {" "}
                    {/* Added font-sans here */}
                    {errors.root.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
