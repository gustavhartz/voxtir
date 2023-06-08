import { Link } from 'react-router-dom';
import React, { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FiArchive, FiEdit, FiShare2 } from 'react-icons/fi';
import { Button as Test } from '../components/Button';
interface ButtonProps {
  children: ReactNode;
  icon?: IconType;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, icon: Icon, onClick }) => {
  return (
    <button
      className={`flex items-center justify-center  border-dashed border-2 border-brand-blue px-4 py-4 text-brand-black rounded-xl hover:bg-brand-grey ${
        Icon ? 'pl-2' : ''
      }`}
      onClick={onClick}
    >
      {Icon && <Icon className="mr-2" />}
      {children}
    </button>
  );
};

const handleClick = () => {
  alert('Not implemented yet');
};

interface Document {
  document_name: string;
  document_id: string;
  last_modified: Date;
  project: string;
}
const data: Document[] = [
  {
    document_name: 'Document 1',
    document_id: '1',
    last_modified: new Date('2023-05-10'),
    project: 'Project A',
  },
  {
    document_name: 'Document 2',
    document_id: '2',
    last_modified: new Date('2023-05-12'),
    project: 'Project B',
  },
  {
    document_name: 'Document 3',
    document_id: '3',
    last_modified: new Date('2023-05-14'),
    project: 'Project C',
  },
];

function Home() {
  return (
    <div className=" px-5 py-5 w-full h-full">
      {/* Top panel */}
      <div className="flex py-10 space-x-8">
        <Button onClick={handleClick} icon={FiEdit}>
          New document
        </Button>
        <Button onClick={handleClick} icon={FiArchive}>
          New project
        </Button>
        <Button onClick={handleClick} icon={FiShare2}>
          Share project
        </Button>
      </div>
      <Test>
        123
      </Test>
      {/* Table start */}
      <div className="flex">
        <table className=" w-full">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="px-4 py-2 flex-grow">Name</th>
              <th className="px-4 py-2">Last modified</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-500">
            {data.map((document) => (
              <tr key={document.document_id}>
                <td className="px-4 py-2 flex-grow">
                  {document.document_name}
                </td>
                <td className="px-4 py-2">
                  {document.last_modified.toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {document.last_modified.toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{document.project}</td>
                <td className="px-4 py-2">
                  <Link to={`/documents?id=${document.document_id}`}>Edit</Link>
                  <Link to={`/documents?id=${document.document_id}`}>
                    Share
                  </Link>
                  <Link to={`/documents?id=${document.document_id}`}>
                    Settings
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Write something</p>
    </div>
  );
}

export default Home;
