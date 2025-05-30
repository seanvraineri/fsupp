import Layout from '../components/Layout';
import AuthForm from '../components/AuthForm';

export default function SignInPage() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <AuthForm mode="signin" />
      </div>
    </Layout>
  );
}