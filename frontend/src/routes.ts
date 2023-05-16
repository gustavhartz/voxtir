import React from 'react';
import { IconType } from 'react-icons';
import {
  AiFillHome,
  AiFillSetting,
  AiFillDollarCircle,
  AiOutlineShareAlt,
} from 'react-icons/ai';

export type SidebarRoute = {
  path: string;
  name: string;
  icon: IconType;
};

export const routes: SidebarRoute[] = [
  {
    path: '/',
    name: 'Home',
    icon: AiFillHome,
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: AiFillSetting,
  },
  {
    path: '/billing',
    name: 'Billing',
    icon: AiFillDollarCircle,
  },
  {
    path: '/share',
    name: 'Share',
    icon: AiOutlineShareAlt,
  },
];
