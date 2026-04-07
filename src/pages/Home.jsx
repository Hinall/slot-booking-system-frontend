import AuthLayout from "../components/Auth/AuthLayout";
import Login from "../components/Auth/Login";
const Home = () => {
  return (
    <AuthLayout>
      {/* <Register /> */}
      <Login />
    </AuthLayout>
  );
};

export default Home;