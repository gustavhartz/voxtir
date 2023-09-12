import './index.css';

import { Document } from '../../graphql/generated/graphql';
interface TranscriptionStatusProps {
  status?: Pick<Document, 'transcriptionStatus'>['transcriptionStatus'];
  type?: Pick<Document, 'transcriptionType'>['transcriptionType'];
}

const TranscriptionStatus: React.FC<TranscriptionStatusProps> = ({
  status,
}) => {
  const classes = () => {
    if (status === 'CREATED') {
      return 'w-6 h-6 bg-gradient-to-b aspect-square from-gray-400 to-gray-500 rounded-full ml-2 mr-6';
    }

    if (status === 'QUEUED') {
      return 'w-6 h-6 bg-gradient-to-b aspect-square from-blue-400 to-gray-500 rounded-full ml-2 mr-6';
    }

    if (status === 'PROCESSING') {
      return 'w-6 h-6 bg-gradient-to-b animate-spin aspect-square from-orange-300  to-orange-700 duration-1000 rounded-full ml-2 mr-6';
    }

    if (status === 'FAILED') {
      return 'w-6 h-6 bg-gradient-to-b aspect-square from-red-500 to-red-800 rounded-full ml-2 mr-6';
    }

    if (status === 'DONE') {
      return 'w-6 h-6 bg-gradient-to-b aspect-square from-green-500 to-gray-700 rounded-full ml-2 mr-6';
    }
  };
  return (
    <>
      <span className={classes()}></span>
    </>
  );
};

export default TranscriptionStatus;
