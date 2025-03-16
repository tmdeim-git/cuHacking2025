import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import Logo from "@/assets/logo.png";

export default function () {
  return (
    <div className="font-sans flex flex-col items-center justify-around h-screen">
      <div className="mb-8 flex flex-col items-center justify-center gap-2 text-5xl font-sans">
        {" "}
        {/* Added font-sans here */}
        <img src={Logo} className="h-48 w-48" />
        QuickPulse
      </div>
      <Button
        variant="default"
        size="lg"
        className="w-full text-3xl h-16 rounded-full font-sans" // Added font-sans here
        asChild
      >
        <Link to="/sign-in" className="font-sans">
          Access my account
        </Link>{" "}
        {/* Added font-sans here */}
      </Button>
    </div>
  );
}
