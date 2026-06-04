import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../hooks/useApi';

const Quiz = () => {
  const { materialId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState([]);
  const [title, setTitle] = useState('');
  const [isCached, setIsCached] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const fetchQuiz = useCallback(async (forceRegenerate = false) => {
    setLoading(true);
    setError('');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
    try {
      let res;
      if (forceRegenerate) {
        setRegenerating(true);
        res = await api.post(`/quiz/${materialId}/regenerate`);
      } else {
        res = await api.get(`/quiz/${materialId}`);
      }
      setQuizData(res.data.quiz);
      setTitle(res.data.title);
      setIsCached(res.data.cached);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Make sure GEMINI_API_KEY is configured.');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, [materialId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSelect = (option) => {
    if (selectedAnswer) return; // Prevent double click
    
    setSelectedAnswer(option);
    
    const isCorrect = option === quizData[currentIndex].correctAnswer;
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-dark-muted">
        <BrainCircuit size={64} className="mb-4 animate-pulse text-lavender-deep" />
        <h2 className="text-xl font-bold text-dark-surface dark:text-white">
          {regenerating ? 'Generating new questions...' : isCached === false ? 'AI is reading your document...' : 'Loading quiz...'}
        </h2>
        <p className="text-sm mt-2">
          {regenerating || !isCached ? 'Generating smart questions based on the PDF content.' : 'Fetching your saved quiz.'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto mt-10">
        <div className="text-red-400 mb-4 flex justify-center"><XCircle size={48} /></div>
        <h2 className="text-xl font-bold text-dark-surface dark:text-white mb-2">Generation Failed</h2>
        <p className="text-sm text-dark-muted mb-6">{error}</p>
        <button onClick={() => navigate('/materials')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-dark-surface dark:text-white transition-all">
          Back to Materials
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto mt-10 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-sage to-lavender rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-3xl text-white font-bold">{score}/{quizData.length}</span>
        </div>
        <h2 className="text-2xl font-bold text-dark-surface dark:text-white mb-2">Quiz Complete!</h2>
        <p className="text-sm text-dark-muted mb-6">Great job testing your knowledge on "{title}".</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setScore(0);
              setIsFinished(false);
            }} 
            className="w-full py-3 bg-lavender/20 hover:bg-lavender/30 text-lavender-deep font-bold rounded-xl transition-all"
          >
            Retake Same Quiz
          </button>
          <button
            onClick={() => fetchQuiz(true)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-dark-surface dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Generate New Questions
          </button>
          <button 
            onClick={() => navigate('/materials')} 
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-dark-muted font-bold rounded-xl transition-all"
          >
            Back to Materials
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/materials')}
        className="flex items-center gap-2 text-sm text-dark-muted hover:text-dark-surface dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold px-3 py-1 bg-misty/20 text-misty-deep rounded-full">
            Question {currentIndex + 1} of {quizData.length}
          </span>
          <div className="flex items-center gap-2">
            {isCached && (
              <span className="text-xs text-dark-muted bg-white/5 px-2 py-1 rounded-full">Saved</span>
            )}
            <button
              onClick={() => fetchQuiz(true)}
              title="Generate new questions"
              className="p-1.5 rounded-lg text-dark-muted hover:text-lavender-deep hover:bg-lavender/10 transition-all"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-dark-surface dark:text-white mb-8 leading-relaxed">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let btnClass = 'bg-white/5 hover:bg-white/10 border-transparent text-dark-surface dark:text-white';
            let icon = null;

            if (selectedAnswer) {
              if (isCorrect) {
                btnClass = 'bg-sage/20 border-sage/50 text-sage-deep shadow-[0_0_15px_rgba(167,243,208,0.3)]';
                icon = <CheckCircle2 size={20} className="text-sage" />;
              } else if (isSelected) {
                btnClass = 'bg-red-400/20 border-red-400/50 text-red-400';
                icon = <XCircle size={20} className="text-red-400" />;
              } else {
                btnClass = 'bg-white/5 opacity-50 border-transparent';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={!!selectedAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${btnClass}`}
              >
                <span className="font-medium">{opt}</span>
                {icon && <span className="shrink-0 ml-3 animate-bounce">{icon}</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation appears after selection */}
        {selectedAnswer && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-lavender/10 border border-lavender/20">
              <p className="text-sm font-bold text-lavender-deep mb-2">Detailed Explanation:</p>
              <p className="text-sm leading-relaxed text-dark-surface dark:text-white/90">
                {currentQ.explanation}
              </p>
            </div>
            
            <button
              onClick={handleNext}
              className="w-full py-4 bg-lavender hover:bg-lavender-deep text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {currentIndex < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
