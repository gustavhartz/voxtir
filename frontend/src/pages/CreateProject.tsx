import { useFormik } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { PageLoader } from '../components/Auth/page-loader';
import withAccessToken from '../components/Auth/with-access-token';
import { useCreateProjectMutation } from '../graphql/generated/graphql';

const CreateProject = ({ token }: { token: string }) => {
  const navigate = useNavigate();
  const [createProjectMutation, { data, loading }] = useCreateProjectMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const initialValues = {
    name: '',
    description: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
  });

  const onSubmit = (values: { name: string; description: string }) => {
    createProjectMutation({
      variables: {
        name: values.name,
        description: values.description,
      },
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  React.useEffect(() => {
    if (data && !loading) {
      navigate(`/`);
    }
  }, [data, loading, navigate]);

  React.useEffect(() => {
    document.title = 'Voxtir - New Project';
  });
  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-6 w-full  -ml-1 transition-all lg:flex lg:items-center lg:justify-center">
      <form
        onSubmit={formik.handleSubmit}
        className="drop-shadow-sm bg-white border p-6 w-full rounded-md text-black lg:w-1/2"
      >
        <h2 className="text-3xl text-gray-800 font-bold mb-8">
          Create new project
        </h2>
        <div className="flex flex-col w-full mb-8">
          <span className="flex flex-row items-center mb-4">
            <span className="bg-gray-700 px-2 mr-2 rounded-full text-white">
              1
            </span>
            <label className="text-xl font-semibold text-black" htmlFor="name">
              Project title
            </label>
          </span>
          <input
            placeholder="Interview with John Doe"
            className={`px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2
            ${
              formik.errors.name && formik.touched.name
                ? 'border-red-800'
                : 'border-gray-300'
            }
            `}
            type="text"
            id="name"
            name="name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name ? (
            <div className="text-red-800 px-1 py-2"> {formik.errors.name}</div>
          ) : null}
        </div>

        <div>
          <span className="flex flex-row items-center mb-4">
            <span className="bg-gray-700 px-2 mr-2 rounded-full text-white">
              2
            </span>
            <label
              className="text-xl font-semibold text-black"
              htmlFor="description"
            >
              Description
            </label>
          </span>
          <textarea
            className={`px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md w-full focus:outline-gray-400 focus:outline-2
                ${
                  formik.errors.name && formik.touched.name
                    ? 'border-red-800'
                    : 'border-gray-300'
                }
            `}
            id="description"
            name="description"
            placeholder="Exploring the future of work with John Doe and John Doe inc."
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

        <button
          disabled={!formik.isValid || !formik.dirty}
          type="submit"
          className="disabled:cursor-not-allowed bg-gray-900 opacity-100 hover:black disabled:opacity-20 duration-500 transition-opacity w-full py-2 mt-4 rounded-lg text-white disabled:text-gray-300 font-medium"
        >
          Create
        </button>
      </form>
    </div>
  );
};

const CreateProjectWithAccessToken = withAccessToken(CreateProject);

export default CreateProjectWithAccessToken;
