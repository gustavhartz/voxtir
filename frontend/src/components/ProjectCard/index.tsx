import 'react-toastify/dist/ReactToastify.css';

import { useFormik } from 'formik';
import React from 'react';
import {
  AiFillPushpin,
  AiOutlineDelete,
  AiOutlinePushpin,
} from 'react-icons/ai';
import { BiShareAlt } from 'react-icons/bi';
import { BsFillShareFill } from 'react-icons/bs';
import { FiEdit3 } from 'react-icons/fi';
import { HiDotsHorizontal } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { Popover } from 'react-tiny-popover';
import { toast, ToastContainer } from 'react-toastify';
import * as Yup from 'yup';

import type {
  MePinnedProjectsQuery,
  Role,
} from '../../graphql/generated/graphql';
import {
  useDeleteProjectMutation,
  usePinProjectMutation,
  useShareProjectMutation,
  useUpdateProjectMutation,
} from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks';
import { refetchPinned } from '../../state/client';

interface ProjectCardProps {
  handleUpdatePinned: () => void;
  handleUpdate: () => void;
  pinnedProjects: MePinnedProjectsQuery | undefined;
  project: {
    name: string;
    id: string;
    description?: string;
    documentLength: number;
    createdAt: Date;
  };
  token: string;
  onDeleteCallback: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  handleUpdatePinned,
  pinnedProjects,
  project,
  token,
  onDeleteCallback,
}): JSX.Element => {
  const [checkDelete, setCheckDelete] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [showShare, setShowShare] = React.useState(false);
  const [email, setEmail] = React.useState<string | undefined>('');
  const [role, setRole] = React.useState<Role | undefined>();

  const dispatch = useAppDispatch();
  const isPinned = pinnedProjects?.pinnedProjects?.find((pinnedProject) => {
    console.log(pinnedProject, project);
    return pinnedProject?.id === project.id;
  });

  const [pinProject] = usePinProjectMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const [deleteProject, { loading }] = useDeleteProjectMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const [updateProject, { loading: updateLoading }] = useUpdateProjectMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const [shareProject] = useShareProjectMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  const initialValues = {
    name: project.name,
    description: project.description || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
  });

  const handleShare = () => {
    if (role && email && project?.id) {
      shareProject({
        variables: {
          role: role,
          shareProjectId: project.id,
          userEmail: email,
        },
      })
        .then((res) => {
          toast(res.data?.shareProject.message, {
            type: 'success',
            toastId: 'shareProjectSuccess',
            position: 'bottom-right',
          });
          toggleShowShareList();
        })
        .catch((error) => {
          if (error) {
            toast(error?.message, {
              type: 'error',
              toastId: 'shareProjectError',
              position: 'bottom-right',
            });
          }
        });
    }
  };

  const onSubmit = async (values: { name: string; description: string }) => {
    updateProject({
      variables: {
        id: project.id,
        name: values.name,
        description: values.description,
      },
    }).then(() => {
      onDeleteCallback();
      setIsEdit(false);
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const handleTogglePopover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPopoverOpen(!isPopoverOpen);
    setCheckDelete(false);
  };

  const handleDeleteProject = async (e: React.MouseEvent) => {
    const projectToDelete = project;
    e.preventDefault();
    e.stopPropagation();

    deleteProject({
      variables: {
        id: project.id,
      },
    })
      .then(() => {
        dispatch(refetchPinned());
        toast(`Deleted project: ${projectToDelete.name}`, {
          type: 'success',
          position: 'bottom-right',
        });
        setCheckDelete(false);
        onDeleteCallback();
      })
      .catch((error) => {
        if (error) {
          toast(error?.message, {
            type: 'error',
            toastId: 'deleteProjectError',
            position: 'bottom-right',
          });
        }
      });
  };

  const handleToggleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCheckDelete(!checkDelete);
  };

  const openEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEdit(true);
  };

  const toggleShowShareList = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowShare(!showShare);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEdit(false);
    setIsPopoverOpen(false);
  };

  const handlePinProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(isPinned, isPinned !== undefined);
    pinProject({
      variables: {
        projectId: project.id,
        pin: isPinned === undefined ? true : false,
      },
    })
      .then(() => {
        handleUpdatePinned();
      })
      .catch(() => {
        handleUpdatePinned();
      });
  };

  const handleAutoClose = () => {
    setIsPopoverOpen(false);
  };

  if (isEdit) {
    return (
      <div
        className={` ${loading && 'animate-pulse'}
            border-gray-200 border-[1px] 
            
            hover:border-gray-300 text-gray-900 
            hover:bg-gradient-to-tl hover:from-white hover:to-gray-100 flex flex-col justify-betweem
            duration-600
            transition-all 
            drop-shadow-sm rounded-lg`}
      >
        <form
          onSubmit={formik.handleSubmit}
          className="drop-shadow-sm p-6 bg-white w-full rounded-md text-black"
        >
          <div className="flex flex-col w-full mb-8">
            <span className="flex flex-row items-center mb-4">
              <label
                className="text-xl font-semibold text-black"
                htmlFor="name"
              >
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
              <div className="text-red-800 px-1 py-2">
                {' '}
                {formik.errors.name}
              </div>
            ) : null}
          </div>

          <div>
            <span className="flex flex-row items-center mb-4">
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
            onClick={cancelEdit}
            className="disabled:cursor-not-allowed bg-gray-600 opacity-100 hover:black disabled:opacity-20 duration-500 transition-opacity py-2 mt-4 mr-2 rounded-lg text-white disabled:text-gray-300 font-medium w-24"
          >
            Cancel
          </button>
          <button
            disabled={!formik.isValid || !formik.dirty}
            type="submit"
            className="disabled:cursor-not-allowed bg-gray-900 opacity-100 hover:black disabled:opacity-20 duration-500 transition-opacity w-64 py-2 mt-4 rounded-lg text-white disabled:text-gray-300 font-medium max-w-md"
          >
            Update
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      {showShare && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-[200] flex justify-center items-center p-4">
          <div className="sm:w-2/4 sm:h-fit bg-white w-full h-1/2 rounded-md p-8">
            <span className="text-3xl mb-4 font-semibold flex flex-row items-center justify-between">
              Share
              <BsFillShareFill size={30} className="ml-4" />
            </span>
            <span className="text-gray-600">
              Enter a email address of a current user and assign project access.{' '}
              <strong>Admin</strong> can create new documents in a project and{' '}
              <strong>Member</strong> can only contribute to existing documents
            </span>

            <input
              autoFocus
              type="text"
              id="documentName"
              value={email}
              placeholder="john@doe.com"
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="mt-6 w-full px-5 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2"
            />
            <select
              defaultValue="none"
              onChange={(e) => setRole(e.currentTarget.value as Role)}
              className="h-10 mt-4 w-full rounded border-r-8 border-transparent font-normal px-4 text-md outline outline-gray-300 focus:outline-gray-400 focus:outline-2"
            >
              <option value="none" disabled>
                Assign access
              </option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
            </select>
            <div className="mt-6 flex flex-row justify-end">
              <button
                onClick={toggleShowShareList}
                className=" bg-gray-200 text-gray-900 mr-2 py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={!email || !role}
                className="disabled:bg-gray-300 bg-gray-900 text-white py-2 px-4 rounded"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
      <Link to={`/project/${project.id}`}>
        <div
          className={` ${loading && 'animate-pulse'}
              border-gray-200 border-[1px] 
              hover:border-gray-300 text-gray-900 
              hover:bg-gradient-to-tl hover:from-white hover:to-gray-100 flex flex-col justify-between
              duration-600 px-6 py-4 h-36
              bg-white transition-all 
              drop-shadow-sm rounded-lg`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-medium">{project?.name}</span>
            <Popover
              onClickOutside={() => setIsPopoverOpen(false)}
              isOpen={isPopoverOpen}
              positions={['left']}
              content={
                <div
                  onMouseLeave={handleAutoClose}
                  className="mr-4 bg-white border-2 border-gray-100 rounded-md text-gray-900 flex flex-row"
                >
                  <div
                    onClick={handlePinProject}
                    className="flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    {isPinned !== undefined ? (
                      <AiFillPushpin size={20} />
                    ) : (
                      <AiOutlinePushpin size={20} />
                    )}
                  </div>
                  <div
                    onClick={toggleShowShareList}
                    className="flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <BiShareAlt size={20} />
                  </div>
                  <div
                    onClick={openEdit}
                    className="flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <FiEdit3 size={20} />
                  </div>
                  {!checkDelete && (
                    <div
                      onClick={handleToggleDelete}
                      className="flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <AiOutlineDelete size={20} />
                    </div>
                  )}
                  {checkDelete && (
                    <div
                      onClick={handleDeleteProject}
                      className="flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-red-700 bg-red-600 text-white transition-all cursor-pointer"
                    >
                      <AiOutlineDelete size={20} className="mr-2" />
                      <span>Delete Project</span>
                    </div>
                  )}
                </div>
              }
            >
              <div className="react-tiny-popover-container">
                <HiDotsHorizontal
                  onClick={handleTogglePopover}
                  size={20}
                  className="fill-gray-400 hover:scale-110 transition-all"
                />
              </div>
            </Popover>
          </div>
          <div>
            {project.description && (
              <p className="text-ellipsis overflow-hidden whitespace-nowrap text-md text-gray-400">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm font-medium">
              {project.createdAt.toDateString()}
            </span>
            {project.documentLength > 0 && (
              <span className="text-gray-400 text-sm">
                {project.documentLength} document{' '}
                {project.documentLength > 1 && 's'}{' '}
              </span>
            )}
            {project.documentLength === 0 && (
              <span className="text-gray-400 text-sm">No documents.</span>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProjectCard;
