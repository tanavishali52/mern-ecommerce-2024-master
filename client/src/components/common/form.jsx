import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { LoadingSpinner } from "./loading-spinner";

function CommonForm({
  onSubmit,
  formData,
  setFormData,
  buttonText,
  formControls,
  isBtnDisabled = false,
  errors = {},
  isSubmitting = false
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formControls.map((controlItem) => (
        <div key={controlItem.name} className="space-y-2">
          <Label htmlFor={controlItem.name}>
            {controlItem.label}
            {controlItem.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {controlItem.componentType === "input" ? (
            <Input
              type={controlItem.type}
              id={controlItem.name}
              name={controlItem.name}
              placeholder={controlItem.placeholder}
              value={formData[controlItem.name]}
              onChange={(e) => setFormData(controlItem.name, e.target.value)}
              className={errors[controlItem.name] ? "border-destructive" : ""}
              disabled={isSubmitting}
              required={controlItem.required}
            />
          ) : controlItem.componentType === "select" ? (
            <Select
              value={formData[controlItem.name]}
              onValueChange={(value) => setFormData(controlItem.name, value)}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={errors[controlItem.name] ? "border-destructive" : ""}
              >
                <SelectValue
                  placeholder={controlItem.placeholder || `Select ${controlItem.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {controlItem.options.map((optionItem) => (
                  <SelectItem key={optionItem.id} value={optionItem.id}>
                    {optionItem.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : controlItem.componentType === "textarea" ? (
            <Textarea
              id={controlItem.name}
              name={controlItem.name}
              placeholder={controlItem.placeholder}
              value={formData[controlItem.name]}
              onChange={(e) => setFormData(controlItem.name, e.target.value)}
              className={errors[controlItem.name] ? "border-destructive" : ""}
              disabled={isSubmitting}
              required={controlItem.required}
            />
          ) : null}
          {errors[controlItem.name] && (
            <p className="text-sm text-destructive">{errors[controlItem.name]}</p>
          )}
        </div>
      ))}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isBtnDisabled || isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : buttonText}
      </Button>
    </form>
  );
}

export default CommonForm;
