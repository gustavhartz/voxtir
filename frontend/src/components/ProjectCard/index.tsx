import React from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit3 } from "react-icons/fi";
import { HiDotsHorizontal } from "react-icons/hi";
import { Link } from "react-router-dom";
import { Popover } from 'react-tiny-popover'

import { useDeleteProjectMutation } from "../../graphql/generated/graphql";

interface ProjectCardProps {
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

const ProjectCard: React.FC<ProjectCardProps> = ({ project, token, onDeleteCallback }): JSX.Element => {
    const [deleteProject, { loading }] = useDeleteProjectMutation({
        context: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
    });

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const handleTogglePopover = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPopoverOpen(!isPopoverOpen);
    }

    const handleDeleteProject = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        await deleteProject({
            variables: {
                id: project.id
            }
        }).then(() => {
            onDeleteCallback();
        })
    }
    return (
        <Link to={`/documents/${project.id}`}>
            <div className={` ${loading && "animate-pulse"}
            border-gray-200 border-[1px] 
            hover:border-gray-300 text-gray-900 
            hover:bg-gradient-to-tl hover:from-white hover:to-gray-100 flex flex-col justify-between
            duration-600 px-6 py-4 h-36
            bg-white transition-all 
            drop-shadow-sm rounded-lg`}>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-medium">{project?.name}</span>
                    <Popover onClickOutside={() => setIsPopoverOpen(false)} isOpen={isPopoverOpen} positions={["bottom"]} content={
                        <div className="mr-8 -mt-11 bg-white border-2 border-gray-100 rounded-md text-gray-900 flex flex-row">
                            <div className="flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer border-r-2">
                                <FiEdit3 size={20} className="mr-2"/> 
                                <span className="pr-2">Edit</span>
                            </div>
                            <div onClick={handleDeleteProject} className="bg-red-600 text-white flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-red-700 transition-all cursor-pointer">
                                <AiOutlineDelete size={20} className="mr-2"/>
                                <span>Delete</span>
                            </div>
                        </div>
                    }>
                        <div className="react-tiny-popover-container">
                            <HiDotsHorizontal onClick={handleTogglePopover} size={20} className="fill-gray-400" />
                        </div>
                    </Popover>
                </div>
                <div>
                    {project.description && <p className="text-md text-gray-400">{project.description}</p>}
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400 text-sm font-medium">{project.createdAt.toDateString()}</span> 
                    {project.documentLength > 0 && <span className="text-gray-400 text-sm">{project.documentLength} documents</span>}
                    {project.documentLength === 0 && <span className="text-gray-400 text-sm">No documents.</span>}
                </div>
            </div>
        </Link>
    )
}

export default ProjectCard;