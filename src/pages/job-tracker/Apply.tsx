import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Send,
  User,
  GraduationCap,
  BookOpen,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  graduationYear: string;
  skills: string;
  cvLink: string;
  coverLetter: string;
}

interface FormErrors {
  [key: string]: string;
}

const currentYear = new Date().getFullYear();

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name || data.name.length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phone) {
    errors.phone = "Phone number is required";
  } else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(data.phone)) {
    errors.phone = "Enter a valid Egyptian phone number (01XXXXXXXXX)";
  }

  if (!data.university || data.university.length < 3) {
    errors.university = "University name is required";
  }

  if (!data.faculty) {
    errors.faculty = "Faculty is required";
  }

  if (!data.graduationYear) {
    errors.graduationYear = "Graduation year is required";
  } else if (!/^20\d{2}$/.test(data.graduationYear)) {
    errors.graduationYear = "Enter a valid 4-digit year";
  } else if (parseInt(data.graduationYear) < currentYear) {
    errors.graduationYear = `Graduation year must be ${currentYear} or later`;
  }

  if (!data.skills) {
    errors.skills = "Please enter at least one skill";
  }

  if (!data.cvLink) {
    errors.cvLink = "CV link is required";
  } else if (!/^https?:\/\/.+/.test(data.cvLink)) {
    errors.cvLink = "Please enter a valid URL";
  }

  return errors;
}

export default function Apply() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    university: "",
    faculty: "",
    graduationYear: "",
    skills: "",
    cvLink: "",
    coverLetter: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const submitMutation = trpc.applications.submit.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      navigate("/success", {
        state: { name: formData.name, email: formData.email },
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application. Please try again.");
    },
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched.has(field)) {
      const newErrors = validateForm({ ...formData, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] || "" }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => new Set(prev).add(field));
    const newErrors = validateForm(formData);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = new Set(Object.keys(formData));
    setTouched(allFields);

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      university: formData.university,
      faculty: formData.faculty,
      graduationYear: formData.graduationYear,
      skills: formData.skills,
      cvLink: formData.cvLink,
      coverLetter: formData.coverLetter || undefined,
    });
  };

  const inputClasses = (field: string) =>
    errors[field] && touched.has(field)
      ? "border-red-500 focus-visible:ring-red-500"
      : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Apply for Software Engineering Intern</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to submit your application. All fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={inputClasses("name")}
                />
                {errors.name && touched.has("name") && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={inputClasses("email")}
                />
                {errors.email && touched.has("email") && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className={inputClasses("phone")}
                />
                <p className="text-xs text-gray-500">Egyptian format: 01XXXXXXXXX (11 digits)</p>
                {errors.phone && touched.has("phone") && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="university">
                  University <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="university"
                  placeholder="e.g. Cairo University"
                  value={formData.university}
                  onChange={(e) => handleChange("university", e.target.value)}
                  onBlur={() => handleBlur("university")}
                  className={inputClasses("university")}
                />
                {errors.university && touched.has("university") && (
                  <p className="text-sm text-red-500">{errors.university}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="faculty">
                  Faculty <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="faculty"
                  placeholder="e.g. Computer Science"
                  value={formData.faculty}
                  onChange={(e) => handleChange("faculty", e.target.value)}
                  onBlur={() => handleBlur("faculty")}
                  className={inputClasses("faculty")}
                />
                {errors.faculty && touched.has("faculty") && (
                  <p className="text-sm text-red-500">{errors.faculty}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">
                  Graduation Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="graduationYear"
                  placeholder={`e.g. ${currentYear}`}
                  value={formData.graduationYear}
                  onChange={(e) => handleChange("graduationYear", e.target.value)}
                  onBlur={() => handleBlur("graduationYear")}
                  className={inputClasses("graduationYear")}
                />
                {errors.graduationYear && touched.has("graduationYear") && (
                  <p className="text-sm text-red-500">{errors.graduationYear}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">
                  Skills <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="skills"
                  placeholder="React, Node.js, TypeScript, Python..."
                  value={formData.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  onBlur={() => handleBlur("skills")}
                  className={inputClasses("skills")}
                />
                <p className="text-xs text-gray-500">Separate skills with commas</p>
                {errors.skills && touched.has("skills") && (
                  <p className="text-sm text-red-500">{errors.skills}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvLink">
                  CV Link (Google Drive) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cvLink"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.cvLink}
                  onChange={(e) => handleChange("cvLink", e.target.value)}
                  onBlur={() => handleBlur("cvLink")}
                  className={inputClasses("cvLink")}
                />
                <p className="text-xs text-gray-500">Share your CV via Google Drive link</p>
                {errors.cvLink && touched.has("cvLink") && (
                  <p className="text-sm text-red-500">{errors.cvLink}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell us why you're interested in this position..."
                  rows={5}
                  value={formData.coverLetter}
                  onChange={(e) => handleChange("coverLetter", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 px-8"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500">
              By submitting, you agree to our terms and privacy policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
