import Link from "next/link";
import { Button } from "@/components/ui/button";

const SigninPage = () => {
  return (
    <div>
      <Button>
        <Link href="/signup">Signup</Link>
      </Button>
    </div>
  );
};

export default SigninPage;
