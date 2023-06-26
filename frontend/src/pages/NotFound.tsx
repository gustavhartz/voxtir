import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-brand-black">
      <h1 className="text-3xl font-heading text-white mb-4">
        Oops! You seem to be lost.
      </h1>
      <p className="text-lg text-gray-200 mb-8">Here are some helpful links:</p>
      <Link to="/" className="text-lg text-brand-light_blue hover:underline">
        Home
      </Link>
    </div>
  );
}
