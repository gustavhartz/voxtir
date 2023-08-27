import React from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { Link } from "react-router-dom";
import { ArrowContainer,Popover } from 'react-tiny-popover'

interface ProjectCardProps {
    name: string;
    id: string;
    description?: string;
    documentLength: number;
    createdAt: Date;
}

const ProjectCard = ({ project } : { project: ProjectCardProps }): JSX.Element => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const handleTogglePopover = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPopoverOpen(!isPopoverOpen);
    }
    return (
        <Link to={`/documents/${project.id}`}>
            <div className="
            border-gray-200 border-[1px] 
            hover:border-gray-300 text-gray-900 
            hover:bg-gradient-to-tl hover:from-white hover:to-gray-100 flex flex-col justify-between
            duration-600 px-6 py-4 h-36
            bg-white transition-all 
            drop-shadow-sm rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-medium">{project?.name}</span>
                    <div className="react-tiny-popover-container">
                    <Popover isOpen={isPopoverOpen} content={<div>hey from popover content</div>}>
                            <HiDotsHorizontal onClick={handleTogglePopover} size={20} className="fill-gray-400" />
                        </Popover>
                    </div>
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