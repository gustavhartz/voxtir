import React, { useRef } from 'react';

import { BaseModalProps } from '../../types/modal';

const TermsConditionsModal: React.FC<BaseModalProps> = ({
  isOpen: isModalOpen,
  toggleOpen,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full m-4 mx-24 px-4 py-4"
      >
        <div>
          <div>
            <label className="text-2xl font-semibold text-black">
              Voxtir Beta Transcription application
            </label>
            <p>
              This is a sample Voxtir app. It's safe to use and lives up to all
              the requirements of a production application for security and data
              processing, but is under continuous development. Meaning is
              updated frequently and might contain minor bugs.
            </p>
            <p>
              We aim to update it on the most hassle free way for our users, but
              the app can become unavailable and seems unresponsive at times. By
              using this software your accept that we provide this service as
              is, which hopefully still lives up to your requirements. For
              production versions or other business inquiries please reach out
              to at{' '}
              <a
                className="text-blue-400 hover:text-blue-700"
                href="mailto:info@voxtir.com"
              >
                info@voxtir.com
              </a>
              . Likewise if you have bug reports or a feature request send an
              email, submit a request to our{' '}
              <a
                className="text-blue-400 hover:text-blue-700"
                href="https://github.com/voxtir/voxtir"
              >
                Github
              </a>{' '}
              or reach out through{' '}
              <a
                className="text-blue-400 hover:text-blue-700"
                href="https://linkedin.com/in/gustavhartz"
              >
                LinkedIn
              </a>
              .
            </p>
            <p>
              {' '}
              By using the software you also agree to our{' '}
              <a
                className="text-blue-400 hover:text-blue-700"
                href="https://docs.google.com/document/d/1nUmNyFWw1DN-MbqJlrRC2Q2lyhyEbfrt0WOg8Rmsay4/edit?usp=drive_link"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                className="text-blue-400 hover:text-blue-700"
                href="https://docs.google.com/document/d/1sRgX_ixzOPPj_l-QfCbULAjkJTtXh-2QYA4ITMERAsI/edit?usp=drive_link"
              >
                Privacy Policy
              </a>
            </p>
            <label className="text-xl font-semibold text-black">Credits</label>
            <p>
              Each user is given 3 free credits to use the app. Each credit is
              valid for 1 transcription of any length up to 3 hours. If you need
              more credits please reach out to us or create a new user. No
              problem, but this is prevent abuse of the app. Please also note
              that file-uploads are limited to 200MB.
            </p>
          </div>
          <button
            className="bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-bold py-2 px-4 mt-4 rounded"
            onClick={toggleOpen}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsModal;
