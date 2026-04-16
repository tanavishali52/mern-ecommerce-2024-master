import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  email: "",
  password: "",
};

function validateForm(formData) {
  const errors = {};
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Invalid email address";
  }
  if (!formData.password?.trim()) {
    errors.password = "Password is required";
  }
  return errors;
}

function AuthLogin({ isDialog = false, setOpen }) {
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading } = useSelector((state) => state.auth);

  async function onSubmit(event) {
    event.preventDefault();
    
    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      if (result.success) {
        toast({
          title: result.message || "Login successful!",
        });
        if (isDialog) {
          setOpen(false);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: error.message || "Login failed",
        variant: "destructive",
      });
    }
  }

  function handleInputChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  return (
    <div className={`mx-auto w-full ${!isDialog && 'max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg mt-20'}`}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <div className="mt-8">
        <CommonForm
          formControls={loginFormControls}
          buttonText="Sign In"
          formData={formData}
          setFormData={handleInputChange}
          onSubmit={onSubmit}
          errors={formErrors}
          isSubmitting={isLoading}
        />
      </div>
      {!isDialog && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary/90 hover:underline"
            to="/auth/register"
          >
            Register here
          </Link>
        </p>
      )}
    </div>
  );
}

export default AuthLogin;
