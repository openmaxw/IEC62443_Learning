import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function GapCenter() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/selection', { replace: true });
  }, [navigate]);

  return null;
}
