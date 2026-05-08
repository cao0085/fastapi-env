import { JazzStandardProvider } from './store/jazz-standard-store';
import { ScoreLayout } from './layouts/ScoreLayout';

export default function App() {
  return (
    <JazzStandardProvider>
      <ScoreLayout />
    </JazzStandardProvider>
  );
}
