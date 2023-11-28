-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 28, 2023 at 04:02 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `webapp`
--

-- --------------------------------------------------------

--
-- Table structure for table `reserving`
--

CREATE TABLE `reserving` (
  `reserving_id` smallint(6) UNSIGNED NOT NULL,
  `room_id` smallint(6) UNSIGNED NOT NULL,
  `user_id` smallint(6) UNSIGNED NOT NULL,
  `time_reserving` varchar(20) NOT NULL,
  `date_reserving` varchar(40) NOT NULL,
  `approved` enum('Approve','Disapprove','Waiting') NOT NULL DEFAULT 'Waiting',
  `message` varchar(60) NOT NULL,
  `comment_user` varchar(60) NOT NULL,
  `approver` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `room_id` smallint(6) UNSIGNED NOT NULL,
  `room_img` varchar(600) NOT NULL,
  `room_name` varchar(30) NOT NULL,
  `room_place` varchar(20) NOT NULL,
  `room_people` varchar(20) NOT NULL,
  `time_slots` set('8-10 A.M.','10-12 P.M.','12-15 P.M.','15-17 P.M.') NOT NULL,
  `room_status` set('Available','Reserved','Waiting','Disabled') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`room_id`, `room_img`, `room_name`, `room_place`, `room_people`, `time_slots`, `room_status`) VALUES
(1, 'https://media.discordapp.net/attachments/878121471719907389/1175088148779388948/meetroom.jpg?ex=6569f51e&is=6557801e&hm=321d716d8f09b9285c23345665c814b2d76438b37b0cf417911226fe9608d1e5&=&width=1105&height=662', 'Meeting Room 1', 'C2 104', '6-8 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(2, 'https://cdn.discordapp.com/attachments/878121471719907389/1175088149173633094/room_.png?ex=6569f51e&is=6557801e&hm=d95af29341d5780fe4006b796413dc3caf6efc1520abcd1873c71830ddfc27f8&', 'Meeting Room 2', 'C1 101', '8-10 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(3, 'https://cdn.discordapp.com/attachments/878121471719907389/1175088149542740111/room1.webp?ex=6569f51e&is=6557801e&hm=df7551a2a3d3d8f68162211f4c38fd8ca7105a8c4b464a2c8ac3a38f8d60dde6&', 'Meeting Room 3', 'C1 103', '6-8 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(4, 'https://cdn.discordapp.com/attachments/878121471719907389/1175088150121545868/meeting6.jpg?ex=6569f51f&is=6557801f&hm=9c1d9392d97180d2374269549353edce889bf95de2a5ce3601325e37696ad6de&', 'Meeting Room 4', 'C2 102', '6-8 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(5, 'https://www.justcoglobal.com/wp-content/uploads/2022/06/meeting-rooms.jpg', 'Meeting Room 5', 'C2 101', '8-10 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(6, 'https://ballantyneexecutivesuites.com/wp-content/uploads/2015/10/Depositphotos_13534536_original.jpg', 'Meeting Room 6', 'C2 104', '6-8 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(7, 'https://www.coalesse.com/wp-content/uploads/2019/05/16-0041815.gif', 'Meeting Room 7', 'C4 101', '6-8 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(8, 'https://cache.marriott.com/content/dam/marriott-renditions/LASST/lasst-ballroom-0036-hor-wide.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=2882px:*', 'Meeting Room 8', 'C3 104', '8-10 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(9, 'https://s3-ap-south-1.amazonaws.com/uploaddocumentstomakeitpublic/wp-content/uploads/2023/04/04202509/Coworking-space-in-mumbai-blog.jpg', 'Meeting Room 9', 'C2 105', '10-12 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(10, 'https://www.grandfortunebangkok.com/wp-content/uploads/sites/204/2021/09/Conference-Room-1-2200x1200.jpg', 'Meeting Room 10', 'C2 106', '8-10 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Available'),
(11, 'https://www.designintegration.co.uk/wp-content/uploads/2020/10/design_integration_conference_room_thumbnail-scaled.jpg', 'Meeting Room 11', 'C2 108', '8-10 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Disabled'),
(12, 'https://www.tagvenue.com/images/location-pages/small/398.jpg', 'Meeting Room 12', 'C2 201', '10-12 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Disabled'),
(13, 'https://assets-global.website-files.com/61cdc308bda4b01d29c5fc56/61eafee12e3c2e0d7c84b871_design-ideas-for-modern-conference-room.jpeg', 'Meeting Room 13', 'C2 202', '4-6 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Disabled'),
(14, 'https://www.peerspace.com/resources/wp-content/uploads/Peerspace-Hotel-Meeting-Room-Featured-Image-1.jpeg', 'Meeting Room 14', 'C2 203', '6-8 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Disabled'),
(15, 'https://officesnapshots.com/wp-content/uploads/2019/12/conference-room-design-1.jpg', 'Meeting Room 15', 'C2 205', '8-10 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Disabled'),
(46, 'https://assets-global.website-files.com/61cdc308bda4b01d29c5fc56/61eafee12e3c2e0d7c84b871_design-ideas-for-modern-conference-room.jpeg', 'Meeting Room 16', 'C2 404', '10-12 person', '8-10 A.M.,10-12 P.M.,12-15 P.M.,15-17 P.M.', 'Disabled');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` smallint(5) UNSIGNED NOT NULL,
  `username` varchar(60) NOT NULL,
  `email` varchar(60) NOT NULL,
  `password` varchar(60) NOT NULL,
  `role` tinyint(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `email`, `password`, `role`) VALUES
(1, 'teacher', 'tt@gmail.com', '$2b$10$rve5Dgriul2C2Be1B6I4K.WYfAzq3eMXmh98NBDJaeSWF9O3FBc6O', 2),
(2, 'staff', 's@gmail.com', '$2b$10$joiBcAftEoq2qXnv6NpYt.ITWYiPo/SNRltHtF10UFhzaau3qzt.i', 3),
(3, 'tt', 'ttt@gmail.com', '$2b$10$8kKlu96H5df9vvQEO116EuXFLbc2G3TWUFsxlykoejJv1aKjnzJoG', 1),
(4, 'eiei', 'e@gmail.com', '$2b$10$lkPBQ/hXTd7fKeZYpG4qeeqbZWa1g/FmA4trQU/VLfjtnAR0KmCzS', 1),
(5, 'mary', 'm@gmail.com', '$2b$10$y6qjsoRf70oHLBr1HW6EVOv/LZd.Rb5fFDKqMmXJtGKlu2zMCy62u', 1),
(45, 'ajan a', 'a@gmail.com', '$2b$10$5THimdsR7ndwdaBQukxAC.I5wK7YXF2D5gmaqxwHc2IYe0PfkxuIy', 2),
(46, 'admin', 'aa@gmail.com', '$2b$10$46hCnh9ujCF6gk6HBBrL0O1pBFB5cPCSbcqa6p61DO71LKpZKUjnC', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `reserving`
--
ALTER TABLE `reserving`
  ADD PRIMARY KEY (`reserving_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`room_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `reserving`
--
ALTER TABLE `reserving`
  MODIFY `reserving_id` smallint(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=228;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `room_id` smallint(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reserving`
--
ALTER TABLE `reserving`
  ADD CONSTRAINT `reserving_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`),
  ADD CONSTRAINT `reserving_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
