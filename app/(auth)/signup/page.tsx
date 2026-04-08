import Link from "next/link";
import SignupCard from "@/components/auth/SignupCard";
const SignupPage = () => {
  return (
    <div>
      <SignupCard />
      <Link href="/signin">Signin</Link>
    </div>
  );
};

export default SignupPage;
