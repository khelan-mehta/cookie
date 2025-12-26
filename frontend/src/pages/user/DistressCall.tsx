import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiArrowRight, FiMapPin } from 'react-icons/fi';
import { Layout } from '../../components/layout/Layout';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TextArea } from '../../components/common/Input';
import { ImageUpload } from '../../components/distress/ImageUpload';
import { AIGuidancePanel } from '../../components/distress/AIGuidancePanel';
import { Loader } from '../../components/common/Loader';
import { useLocation } from '../../hooks/useLocation';
import { useDistress } from '../../context/DistressContext';
import { distressService } from '../../services/distress';
import { aiService, type AIAnalysisResult } from '../../services/ai';
import { ROUTES } from '../../utils/constants';
import { isValidDescription } from '../../utils/validators';

type Step = 'image' | 'description' | 'submit';

export const DistressCall = () => {
  const navigate = useNavigate();
  const { coordinates, isLoading: locationLoading, error: locationError } = useLocation();
  const { setActiveDistress, setAIAnalysis } = useDistress();

  const [step, setStep] = useState<Step>('image');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setLocalAIAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const handleNextStep = () => {
    if (step === 'image') {
      setStep('description');
    } else if (step === 'description') {
      if (!isValidDescription(description)) {
        toast.error('Please provide at least 10 characters of description');
        return;
      }
      setStep('submit');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'description') {
      setStep('image');
    } else if (step === 'submit') {
      setStep('description');
    }
  };

  const handleSubmit = async () => {
    if (!coordinates) {
      toast.error('Location is required. Please enable location access.');
      return;
    }

    if (!isValidDescription(description)) {
      toast.error('Please provide a valid description');
      return;
    }

    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      // Run AI analysis and distress creation in parallel
      const [distressResult] = await Promise.all([
        distressService.createDistress({
          imageUrl,
          description,
          location: {
            coordinates,
          },
        }),
        // AI analysis runs in parallel but doesn't block
        aiService.analyzeDistress(imageUrl, description).then((result) => {
          setLocalAIAnalysis(result.analysis);
          setAIAnalysis(result.analysis);
          setIsAnalyzing(false);

          // Update the distress with AI analysis
          if (distressResult?.distress?.id) {
            distressService.updateAIAnalysis(
              distressResult.distress.id,
              result.analysis
            ).catch(console.error);
          }
        }).catch((err) => {
          console.error('AI analysis failed:', err);
          setIsAnalyzing(false);
        }),
      ]);

      toast.success('Emergency reported! Help is on the way.');

      // Fetch and set the full distress data
      const fullDistress = await distressService.getDistress(distressResult.distress.id);
      setActiveDistress(fullDistress.distress);

      navigate(ROUTES.TRACKING);
    } catch (err) {
      toast.error('Failed to create emergency. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            {['image', 'description', 'submit'].map((s, i) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  ['image', 'description', 'submit'].indexOf(step) >= i
                    ? 'bg-rose-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Report Emergency
        </h1>

        {/* Location Status */}
        <Card className="mb-6">
          <CardBody className="flex items-center gap-3">
            <FiMapPin className={`h-5 w-5 ${coordinates ? 'text-green-500' : 'text-gray-400'}`} />
            {locationLoading ? (
              <span className="text-gray-500">Getting your location...</span>
            ) : locationError ? (
              <span className="text-red-500 text-sm">{locationError}</span>
            ) : (
              <span className="text-green-600">Location acquired</span>
            )}
          </CardBody>
        </Card>

        {/* Step: Image Upload */}
        {step === 'image' && (
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Add a Photo (Optional)
              </h2>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                currentImage={imageUrl}
                onClear={() => setImageUrl(undefined)}
              />
              <div className="mt-6 flex justify-end">
                <Button onClick={handleNextStep}>
                  Next
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step: Description */}
        {step === 'description' && (
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Describe the Situation
              </h2>
              <TextArea
                placeholder="Describe what happened and the animal's condition. Include details like:
- Type of animal
- Visible injuries or symptoms
- How long has it been like this
- Animal's behavior"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                helperText={`${description.length} characters (minimum 10)`}
              />
              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={handlePreviousStep}>
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNextStep}>
                  Next
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step: Review & Submit */}
        {step === 'submit' && (
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Step 3: Review & Submit
                </h2>

                {imageUrl && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Photo</p>
                    <img
                      src={imageUrl}
                      alt="Emergency"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-900">{description}</p>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={handlePreviousStep}>
                    <FiArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={!coordinates}
                  >
                    Submit Emergency
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* AI Analysis (if already received) */}
            {(isAnalyzing || aiAnalysis) && (
              <AIGuidancePanel
                analysis={aiAnalysis}
                isLoading={isAnalyzing}
                collapsible={false}
              />
            )}
          </div>
        )}

        {/* Submitting Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="mx-4 max-w-sm">
              <CardBody className="text-center py-8">
                <Loader size="lg" />
                <h3 className="font-semibold text-gray-900 mt-4">
                  Submitting Emergency
                </h3>
                <p className="text-gray-600 mt-2">
                  Notifying nearby vets...
                </p>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};
