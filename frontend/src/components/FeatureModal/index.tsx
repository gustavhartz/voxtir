import { useFormik } from 'formik';
import React, { useEffect,useRef } from 'react';
import { MdOutlineQuestionAnswer } from "react-icons/md";
import * as Yup from "yup";

interface BugModalProps {
    isOpen: boolean;
    toggleOpen: () => void;
}

const BugModal: React.FC<BugModalProps> = ({ isOpen: isModalOpen, toggleOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const initialValues = {
    problem: '',
    description: '',
  };

  const validationSchema = Yup.object({
    problem: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
  });

  const onSubmit = (values: { problem: string; description: string }) => {
    // Run mutation here
    //.then -> toggleOpen()
    toggleOpen();
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      toggleOpen();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen]);

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full m-4 mx-24 px-4 py-4"
      >
        <form
        onSubmit={formik.handleSubmit}
        className="drop-shadow-sm bg-white p-6 w-full rounded-md text-black lg:w-1/2"
      >
        <h2 className="text-3xl text-gray-800 font-bold mb-8 flex flex-row items-center">
         <MdOutlineQuestionAnswer size={35} className="mr-2"/> Request a feature
        </h2>
        <div className="flex flex-col w-full mb-8">
          <span className="flex flex-row items-center mb-4">
            <label className="text-xl font-semibold text-black" htmlFor="name">
              What would be a good feature to add?
            </label>
          </span>
          <input
            placeholder="Projects does not finish loading."
            className={`px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2
            ${
              formik.errors.problem && formik.touched.problem
                ? 'border-red-800'
                : 'border-gray-300'
            }
            `}
            type="text"
            id="problem"
            name="problem"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.problem}
          />
          {formik.touched.problem && formik.errors.problem ? (
            <div className="text-red-800 px-1 py-2"> {formik.errors.problem}</div>
          ) : null}
        </div>

        <div>
          <span className="flex flex-row items-center mb-4">
            <label
              className="text-xl font-semibold text-black"
              htmlFor="description"
            >
              Could you perhaps give detail on how this feature would work?
            </label>
          </span>
          <textarea
            className={`px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md w-full focus:outline-gray-400 focus:outline-2
                ${
                  formik.errors.problem && formik.touched.problem
                    ? 'border-red-800'
                    : 'border-gray-300'
                }
            `}
            id="description"
            name="description"
            placeholder="After I updated my document the projects page does not load anymore.."
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="text-red-800 px-1">
              {' '}
              {formik.errors.description}
            </div>
          ) : null}
        </div>

        <div className="flex flex-row items-center space-x-4 justify-end">
          <button
            className="bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-bold py-2 px-4 mt-4 rounded"
            onClick={toggleOpen}
          >
            Close
          </button>
          <button
            disabled={!formik.isValid || !formik.dirty}
            type="submit"
            className="disabled:cursor-not-allowed bg-gray-900 opacity-100 hover:black disabled:opacity-20 duration-500 transition-opacity px-4 py-2 mt-4 rounded text-white disabled:text-gray-300 font-medium"
          >
            Send request
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default BugModal;
