import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function validateForm(formData) {
  const errors = {};
  if (!formData.userName?.trim()) errors.userName = "Name is required";
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Invalid email address";
  }
  if (!formData.password?.trim()) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
}

function AuthRegister({ isDialog = false, setOpen }) {
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
      const result = await dispatch(registerUser(formData)).unwrap();
      if (result.success) {
        toast({
          title: result.message || "Registration successful!",
        });
        if (isDialog) {
          setOpen(false);
        } else {
          navigate("/auth/login");
        }
      }
    } catch (error) {
      toast({
        title: error.message || "Registration failed",
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
          Create Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to create your account
        </p>
      </div>
      <div className="mt-8">
        <CommonForm
          formControls={registerFormControls}
          buttonText="Sign Up"
          formData={formData}
          setFormData={handleInputChange}
          onSubmit={onSubmit}
          errors={formErrors}
          isSubmitting={isLoading}
        />
      </div>
      {!isDialog && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary/90 hover:underline"
            to="/auth/login"
          >
            Sign in here
          </Link>
        </p>
      )}
    </div>
  );
}

export default AuthRegister;
