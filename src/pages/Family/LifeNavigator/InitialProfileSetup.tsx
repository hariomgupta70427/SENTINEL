import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from './index';
import { UserCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InitialProfileSetupProps {
  profile: UserProfile;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
  voiceGuidance: boolean;
  onComplete: () => void;
}

const InitialProfileSetup: React.FC<InitialProfileSetupProps> = ({
  profile,
  onProfileUpdate,
  voiceGuidance,
  onComplete
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Voice guidance effect
  useEffect(() => {
    if (voiceGuidance) {
      try {
        const message = t('life_navigator.profile.voice_guidance', 'Welcome to profile setup. Please complete your profile information to help us personalize your experience.');
        const utterance = new SpeechSynthesisUtterance(message);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Speech synthesis failed:", error);
      }
    }
  }, [voiceGuidance, t]);

  const handleChange = (field: string, value: any) => {
    let updatedFormData;
    
    if (field.includes('.')) {
      // Handle nested fields (e.g., 'identification.aadhaarNumber')
      const [parent, child] = field.split('.');
      updatedFormData = {
        ...formData,
        [parent]: {
          ...(formData[parent as keyof UserProfile] || {}),
          [child]: value
        }
      };
    } else {
      // Handle top-level fields
      updatedFormData = { ...formData, [field]: value };
    }
    
    setFormData(updatedFormData);
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }
    
    if (formData.relationship === 'child' && !formData.age) {
      newErrors.age = 'Age is required for children';
    }
    
    // Martyr information validation
    if (!formData.martyr?.name) {
      newErrors['martyr.name'] = 'Martyr name is required';
    }
    
    if (!formData.martyr?.force) {
      newErrors['martyr.force'] = 'Force is required';
    }
    
    if (!formData.challenges || formData.challenges.length === 0) {
      newErrors.challenges = 'Please select at least one challenge';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setFormSubmitted(true);
    
    if (validateForm()) {
      // Update profile with form data
      const updatedProfile = {
        ...formData,
        isProfileComplete: true,
        identification: {
          idType: "None",
          idNumber: "None",
          aadhaarNumber: "000000000000"
        }
      };
      onProfileUpdate(updatedProfile);
      
      // Redirect to dashboard after completion
      onComplete();
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Common challenges for martyr families
  const challengeOptions = [
    { id: 'pension', label: 'Pending Pension' },
    { id: 'education', label: 'Need School Admission' },
    { id: 'job', label: 'Looking for Job' },
    { id: 'document', label: 'No ID Proof' },
    { id: 'housing', label: 'Housing/Accommodation Issues' },
    { id: 'medical', label: 'Medical Support Needed' },
    { id: 'legal', label: 'Legal Assistance Required' },
    { id: 'finance', label: 'Financial Support Needed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center">
          <UserCircle className="mr-2 h-6 w-6 text-military" />
          {t('life_navigator.profile.title', 'Profile Setup')}
        </h2>
        <Button 
          variant="outline" 
          className="border-military/50 text-military"
          onClick={() => window.history.back()}
        >
          Back to Previous Page
        </Button>
      </div>

      {formSubmitted && Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Please fill in all required fields before proceeding.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-[#1A1A1A]/30 border-[#2D3748]">
        <CardHeader>
          <CardTitle className="text-xl">
            {t('life_navigator.profile.personal_info', 'Personal Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              {t('life_navigator.profile.your_name', 'Your Name')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t('life_navigator.profile.enter_name', 'Enter your full name')}
              className={`bg-[#1A1A1A]/50 border-[#2D3748] ${errors.name ? 'border-red-500' : ''}`}
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              {t('life_navigator.profile.relationship', 'Your Relationship to Martyr')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <RadioGroup 
              value={formData.relationship || ''} 
              onValueChange={(value) => handleChange('relationship', value)}
              className={`flex flex-col space-y-2 ${errors.relationship ? 'border border-red-500 rounded-md p-2' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="widow" id="widow" />
                <Label htmlFor="widow">{t('life_navigator.profile.widow', 'Widow/Spouse')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="child" id="child" />
                <Label htmlFor="child">{t('life_navigator.profile.child', 'Child')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parent" id="parent" />
                <Label htmlFor="parent">{t('life_navigator.profile.parent', 'Parent')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">{t('life_navigator.profile.other', 'Other')}</Label>
              </div>
            </RadioGroup>
            {errors.relationship && <p className="text-sm text-red-500">{errors.relationship}</p>}
          </div>

          {formData.relationship === 'child' && (
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center">
                {t('life_navigator.profile.age', 'Your Age')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder={t('life_navigator.profile.enter_age', 'Enter your age')}
                className={`bg-[#1A1A1A]/50 border-[#2D3748] ${errors.age ? 'border-red-500' : ''}`}
                value={formData.age || ''}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
              />
              {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="educationLevel">
              {t('life_navigator.profile.education_level', 'Current Education Level')}
            </Label>
            <Select 
              value={formData.educationLevel || ''} 
              onValueChange={(value) => handleChange('educationLevel', value)}
            >
              <SelectTrigger id="educationLevel" className="bg-[#1A1A1A]/50 border-[#2D3748]">
                <SelectValue placeholder={t('life_navigator.profile.select_education', 'Select education level')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary School</SelectItem>
                <SelectItem value="secondary">Secondary School</SelectItem>
                <SelectItem value="higher_secondary">Higher Secondary</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A]/30 border-[#2D3748]">
        <CardHeader>
          <CardTitle className="text-xl">
            {t('life_navigator.profile.martyr_info', 'Martyr Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="martyrName" className="flex items-center">
              {t('life_navigator.profile.martyr_name', 'Name')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="martyrName"
              placeholder={t('life_navigator.profile.enter_martyr_name', 'Enter martyr name')}
              className={`bg-[#1A1A1A]/50 border-[#2D3748] ${errors['martyr.name'] ? 'border-red-500' : ''}`}
              value={formData.martyr?.name || ''}
              onChange={(e) => handleChange('martyr', { ...(formData.martyr || {}), name: e.target.value })}
            />
            {errors['martyr.name'] && <p className="text-sm text-red-500">{errors['martyr.name']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="martyrRank">
              {t('life_navigator.profile.martyr_rank', 'Rank')}
            </Label>
            <Input
              id="martyrRank"
              placeholder={t('life_navigator.profile.enter_martyr_rank', 'Enter rank')}
              className="bg-[#1A1A1A]/50 border-[#2D3748]"
              value={formData.martyr?.rank || ''}
              onChange={(e) => handleChange('martyr', { ...(formData.martyr || {}), rank: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="martyrForce" className="flex items-center">
              {t('life_navigator.profile.force', 'Force')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              value={formData.martyr?.force || ''} 
              onValueChange={(value) => handleChange('martyr', { ...(formData.martyr || {}), force: value })}
            >
              <SelectTrigger 
                id="martyrForce" 
                className={`bg-[#1A1A1A]/50 border-[#2D3748] ${errors['martyr.force'] ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder={t('life_navigator.profile.select_force', 'Select force')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indian Army">{t('life_navigator.profile.indian_army', 'Indian Army')}</SelectItem>
                <SelectItem value="Indian Navy">{t('life_navigator.profile.indian_navy', 'Indian Navy')}</SelectItem>
                <SelectItem value="Indian Air Force">{t('life_navigator.profile.indian_air_force', 'Indian Air Force')}</SelectItem>
                <SelectItem value="Central Armed Police Forces">{t('life_navigator.profile.capf', 'Central Armed Police Forces')}</SelectItem>
              </SelectContent>
            </Select>
            {errors['martyr.force'] && <p className="text-sm text-red-500">{errors['martyr.force']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="martyrdomDate">
              {t('life_navigator.profile.date_of_martyrdom', 'Date of Martyrdom')}
            </Label>
            <Input
              id="martyrdomDate"
              type="date"
              className="bg-[#1A1A1A]/50 border-[#2D3748]"
              value={formData.martyr?.dateOfMartyrdom || ''}
              onChange={(e) => handleChange('martyr', { ...(formData.martyr || {}), dateOfMartyrdom: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A]/30 border-[#2D3748]">
        <CardHeader>
          <CardTitle className="text-xl">
            {t('life_navigator.profile.challenges', 'Current Challenges')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="flex items-center mb-2">
              Select the challenges you're currently facing
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${errors.challenges ? 'border border-red-500 rounded-md p-2' : ''}`}>
              {challengeOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id}
                    checked={formData.challenges?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const currentChallenges = formData.challenges || [];
                      const updatedChallenges = checked
                        ? [...currentChallenges, option.id]
                        : currentChallenges.filter(id => id !== option.id);
                      
                      handleChange('challenges', updatedChallenges);
                    }}
                  />
                  <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.challenges && <p className="text-sm text-red-500">{errors.challenges}</p>}
            <p className="text-xs text-white/60 mt-2">
              This helps us tailor your roadmap to address your specific needs.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          className="bg-military hover:bg-military/80 text-white"
          onClick={handleSubmit}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {t('life_navigator.profile.save_profile', 'Complete Profile Setup')}
        </Button>
      </div>

      {profile.isProfileComplete && (
        <Card className="bg-green-900/20 border-green-600/30">
          <CardContent className="p-4 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-300">
              {t('life_navigator.profile.complete', 'Profile is complete! You can now access all features.')}
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InitialProfileSetup; 