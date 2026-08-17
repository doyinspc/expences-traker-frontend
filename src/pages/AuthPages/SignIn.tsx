import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Prokure - Expences Management System | SignIn"
        description="The Prokure SignIn page allows users to securely access their accounts and manage expenses efficiently. Sign in to streamline your expense management process."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
