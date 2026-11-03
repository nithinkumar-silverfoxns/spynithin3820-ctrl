-- T.T.T Academy DCET website — schema + verified seed data
-- Generated 2026-11-03T22:01:30+05:30 by database/install.php --sql
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  login_id VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(15) NULL,
  email VARCHAR(120) NULL,
  batch VARCHAR(120) NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('admission','demo','contact') NOT NULL DEFAULT 'admission',
  status ENUM('new','contacted','enrolled','closed') NOT NULL DEFAULT 'new',
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(120) NULL,
  course VARCHAR(120) NULL,
  branch VARCHAR(120) NULL,
  mode VARCHAR(20) NULL,
  diploma VARCHAR(80) NULL,
  message TEXT NULL,
  preferred_date DATE NULL,
  slot VARCHAR(20) NULL,
  admin_note TEXT NULL,
  ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(255) NULL,
  source_page VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_created (created_at),
  KEY idx_ip_created (ip, created_at),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scope VARCHAR(10) NOT NULL,
  identifier VARCHAR(80) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_lookup (scope, identifier, attempted_at),
  KEY idx_ip (scope, ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(60) NOT NULL PRIMARY KEY,
  `value` TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(120) NOT NULL,
  `name` VARCHAR(255) NULL,
  `type_label` VARCHAR(255) NULL,
  `duration` VARCHAR(255) NULL,
  `duration_months` INT NULL,
  `tagline` VARCHAR(255) NULL,
  `summary` TEXT NULL,
  `description` TEXT NULL,
  `ideal_for` TEXT NULL,
  `timings` TEXT NULL,
  `features` TEXT NULL,
  `materials` TEXT NULL,
  `image` VARCHAR(500) NULL,
  `accent` VARCHAR(20) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `toppers` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NULL,
  `rank_no` INT NULL,
  `year` INT NULL,
  `score` VARCHAR(255) NULL,
  `diploma_college` VARCHAR(255) NULL,
  `admitted_college` VARCHAR(255) NULL,
  `photo` VARCHAR(500) NULL,
  `story` TEXT NULL,
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_year (year, rank_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `results` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `year` INT NULL,
  `best_rank` INT NULL,
  `below_10` INT NULL,
  `below_100` INT NULL,
  `below_200` INT NULL,
  `below_500` INT NULL,
  `below_1000` INT NULL,
  `below_1500` INT NULL,
  `below_2000` INT NULL,
  `poster` VARCHAR(500) NULL,
  `source_note` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rankers` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `year` INT NULL,
  `rank_no` INT NULL,
  `category` VARCHAR(255) NULL,
  `name` VARCHAR(255) NULL,
  `college` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_year (year, rank_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admissions` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `college` VARCHAR(255) NULL,
  `students` INT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `testimonials` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NULL,
  `title` VARCHAR(255) NULL,
  `year` INT NULL,
  `quote` TEXT NULL,
  `photo` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `videos` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `youtube_id` VARCHAR(255) NULL,
  `title` VARCHAR(255) NULL,
  `category` VARCHAR(40) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faculty` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NULL,
  `role` VARCHAR(255) NULL,
  `qualification` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `member_group` VARCHAR(40) NULL,
  `photo` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NULL,
  `image` VARCHAR(500) NULL,
  `category` VARCHAR(40) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `materials` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `category` VARCHAR(40) NULL,
  `file` VARCHAR(500) NULL,
  `access` VARCHAR(40) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `syllabus` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `subject` VARCHAR(255) NULL,
  `short` VARCHAR(255) NULL,
  `marks` INT NULL,
  `topics` TEXT NULL,
  `tip` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `question` VARCHAR(255) NULL,
  `answer` TEXT NULL,
  `category` VARCHAR(40) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branches` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `phone` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `map_embed` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- courses
INSERT INTO `courses` (`slug`,`name`,`type_label`,`duration`,`duration_months`,`tagline`,`summary`,`description`,`ideal_for`,`timings`,`features`,`materials`,`image`,`accent`,`sort_order`,`is_active`) VALUES ('pratigna-long-term-batch','Pratigna','Long Term Batch','12 Months',12,'A full year of rank-focused DCET preparation','A powerful, high-intensity preparation program specially designed for diploma students aiming for top ranks in the DCET exam.','The Pratigna Long Term Course is designed to clear all your doubts and teach you exactly what you need to know to secure a top state rank in DCET. We offer premium physical classrooms alongside great digital tools: track your daily attendance with our AI facial scanner and check your progress reports anytime on the TTT Student Dashboard. Batch intake is limited so that every student receives personal attention and 1-on-1 mentoring.','["Diploma students who want a complete, unhurried year of structured DCET preparation","Students aiming for a top state rank and a seat in a top engineering college","Learners who want full syllabus coverage plus time-saving shortcut techniques"]','["Morning Regular Batch | Timings confirmed at admission counselling","Evening Regular Batch | Timings confirmed at admission counselling","Weekend Extended Batch | Timings confirmed at admission counselling"]','["Both offline & online classes available","AI face-tracking & smart QR attendance","Learn directly from DCET textbook authors","Full syllabus coverage","Time-saving shortcut techniques","Spacious air-conditioned classrooms","Recorded class access on mobile, PC or laptop","AI chatbot trained on the DCET exam pattern for 24\\/7 doubt solving","Limited batch intake with 1-on-1 mentoring","Progress reports on the TTT Student Dashboard"]','["Official TTT DCET Book (QR admission discount)","Weekly & full-length DCET mock tests","Recorded classes for revision","Previous year question papers with solutions"]','assets/img/courses/pratigna.webp','#2F6BFF',1,1);
INSERT INTO `courses` (`slug`,`name`,`type_label`,`duration`,`duration_months`,`tagline`,`summary`,`description`,`ideal_for`,`timings`,`features`,`materials`,`image`,`accent`,`sort_order`,`is_active`) VALUES ('jnana-short-term-batch','Jnana','Short Term Batch','6 Months',6,'Built for top rankers through deep knowledge','A carefully curated short-term program for DCET aspirants who expect precision, discipline and results — with AI-integrated learning and a premium campus experience.','Every minute of your DCET journey is structured, tracked and optimised. Jnana Batch offers branch-wise mentoring with expert faculty for Branch 1 & Branch 2, a structured test calendar (weekly chapter tests, monthly grand tests and full DCET simulations), and a hybrid class system so you can learn offline, live online or from recordings. Students get free entry to the Crash Course after 6th sem.','["Diploma students from Mechanical, Civil, Electrical, Electronics and Computer Science who want a clear, rank-focused plan","Students after 6th sem \\u2014 free entry for the Crash Course","Outstation students \\u2014 live online classes, or separate PG facilities for boys and girls near the academy","Every kind of learner \\u2014 extra support for slow learners and meritorious students alike"]','["Peenya \\u00b7 Morning (B-1) | 06:30 AM \\u2013 09:00 AM, everyday","Peenya \\u00b7 Evening (B-1) | 06:00 PM \\u2013 08:30 PM, everyday","Hesaraghatta \\u00b7 Evening (B-2) | 06:30 PM \\u2013 09:00 PM, everyday","Peenya \\u00b7 Weekend | Fri & Sat 6:00 \\u2013 8:00 PM \\u00b7 Sun 10:00 AM \\u2013 2:00 PM"]','["AI-based student attendance for online & offline classes","TTT Student Panel \\u2014 online classes, tests & instant results","Classes conducted by DCET book authors","Chapter-wise live classes & unit-wise revision PPTs","Chapter-wise key topic explanation videos","TTT DCET Text Book (soft copy) & unit-wise Maths MCQ solutions","Weekly mock tests through the Student Panel","Recorded classes with 24\\u00d77 access (after every live session, if recorded)","Previous year question papers & solutions","OMR mock exams & unit-wise notes","Counselling \\/ guidance through live sessions","Previous year college-wise seat matrix & cutoff PDF"]','["TTT DCET Text Book (soft copy)","Unit-wise Maths MCQ solutions","Unit-wise revision PPTs","Chapter-wise key topic videos","Previous year papers with solutions","OMR mock exams","Unit-wise notes","Seat matrix & cutoff PDF"]','assets/img/courses/jnana.webp','#7C3AED',2,1);
INSERT INTO `courses` (`slug`,`name`,`type_label`,`duration`,`duration_months`,`tagline`,`summary`,`description`,`ideal_for`,`timings`,`features`,`materials`,`image`,`accent`,`sort_order`,`is_active`) VALUES ('pragathi-crash-course','Pragathi','Crash Course','2 Months',2,'Your last step towards a DCET rank — crack DCET in just 50 days','A high-intensity crash program for diploma students aiming for top DCET ranks, with everything from AI-based attendance to one-on-one mentoring.','For diploma students in Karnataka, DCET is the gateway to 2nd year engineering. Pragathi delivers intensive preparation, classes by the authors of standard DCET textbooks, an AI-driven student panel, shortcut techniques and weekly OMR-based mock tests — designed for the final stretch before the exam.','["Students who have finished their final semester and want focused DCET revision","Jnana Batch students (free entry after 6th sem)","Aspirants who need exam-pattern practice, speed and accuracy in the last 50 days"]','["Morning \\/ Evening \\/ Weekend | Batch timings shared at admission counselling"]','["AI-based student attendance system","TTT Student Panel access","Classes by DCET book authors","Complete DCET syllabus preparation","Chapter-wise live classes + PPTs","Key topic explanation videos","Shortcut techniques & strategies","Recorded classes + AI chatbot for 24\\/7 doubt solving","Live counselling sessions","AC classrooms with comfortable, spacious seating"]','["TTT DCET Textbook (soft copy) with MCQs & solutions","DCET study materials & notes","Previous year papers with step-by-step solutions","Weekly OMR-based mock tests","Seat matrix & cutoff PDF"]','assets/img/courses/pragathi.webp','#0EA5E9',3,1);

-- toppers
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Keshavaram',3,2026,'91/100','Smt. L V Polytechnic, Hassan','','assets/img/toppers/2026-keshavaram.webp','',1,1,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Poorna Tejas',4,2026,'91/100','Siddaganga, Tumakuru','','assets/img/toppers/2026-poorna-tejas.webp','',1,2,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Faiz Ahmed',6,2026,'92/100','SMP Sagar','','assets/img/toppers/2026-faiz-ahmed.webp','',1,3,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Yuktha Boomika',9,2026,'89/100','MSRP Bengaluru','','assets/img/toppers/2026-yuktha-boomika.webp','',1,4,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Meghana Rodd',11,2026,'89/100','KLSSVP Belagavi','','assets/img/toppers/2026-meghana-rodd.webp','',0,5,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Abhigna H',1,2025,'93/100','MSRP Bengaluru','','assets/img/toppers/2025-abhigna-h.webp','Securing the state first rank feels surreal, I owe this moment to TTT Academy that stood by me throughout this journey. The dedication of faculties and the smart study strategies and the constant support and motivation created a perfect study environment for effective learning.',1,1,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Jashua Anish',4,2025,'87/100','CSIP Kanyakumari','','assets/img/toppers/2025-jashua-anish.webp','',1,2,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Thanushree',8,2025,'90/100','NITTE Polytechnic, Bengaluru','','assets/img/toppers/2025-thanushree.webp','',0,3,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Darshan Raj',10,2025,'90/100','Acharya Bengaluru','','assets/img/toppers/2025-darshan-raj.webp','',0,4,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Manohar D S',3,2024,'94/100','MEI Bengaluru','RV College of Engineering — B.E. (CSE)','assets/img/toppers/2024-manohar-d-s.webp','The infrastructure and classes were all good and well guided, good teaching facilities. Overall had a good experience and now pursuing my BE(CSE) at RVCE.',1,1,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Lekhan C',8,2024,'92/100','VISSJ Shivamogga','','assets/img/toppers/2024-lekhan-c.webp','',0,2,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Suhas Shetty',11,2024,'92/100','SVP Kumta','','assets/img/toppers/2024-suhas-shetty.webp','',0,3,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Pavana B V',12,2024,'91/100','SJP Bengaluru','','assets/img/toppers/2024-pavana-b-v.webp','',0,4,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Santhrupth H R',1,2023,'93/100','GTTC Gauribidanur','','assets/img/toppers/2023-santhrupth-h-r.webp','TTT Institution has provided excellent guidance for DCET preparation, ensuring my success and securing 1st rank in Karnataka State. Special gratitude to Savin Sir and the dedicated team for their effective online coaching classes.',1,1,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Srujan',7,2023,'91/100','BLDEA Vijayapura','','assets/img/toppers/2023-srujan.webp','',1,2,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Gopinath',8,2023,'90/100','SJPN Nidasoshi','','assets/img/toppers/2023-gopinath.webp','',0,3,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Chandana',10,2023,'89/100','SP Ramanagara','','assets/img/toppers/2023-chandana.webp','',0,4,1);
INSERT INTO `toppers` (`name`,`rank_no`,`year`,`score`,`diploma_college`,`admitted_college`,`photo`,`story`,`featured`,`sort_order`,`is_active`) VALUES ('Uvika S',61,2025,'','MEIP Bengaluru','RV College of Engineering','','',0,9,1);

-- results
INSERT INTO `results` (`year`,`best_rank`,`below_10`,`below_100`,`below_200`,`below_500`,`below_1000`,`below_1500`,`below_2000`,`poster`,`source_note`,`is_active`) VALUES (2026,3,4,36,72,172,299,376,437,'assets/img/posters/dcet-2026-rank-holders.webp','TTT Academy official DCET 2026 results poster',1);
INSERT INTO `results` (`year`,`best_rank`,`below_10`,`below_100`,`below_200`,`below_500`,`below_1000`,`below_1500`,`below_2000`,`poster`,`source_note`,`is_active`) VALUES (2025,1,4,31,53,109,182,259,341,'assets/img/posters/dcet-2025-rank-holders.webp','TTT Academy official DCET 2025 results poster',1);
INSERT INTO `results` (`year`,`best_rank`,`below_10`,`below_100`,`below_200`,`below_500`,`below_1000`,`below_1500`,`below_2000`,`poster`,`source_note`,`is_active`) VALUES (2024,3,2,32,46,99,180,257,330,'assets/img/posters/dcet-2024-rank-holders.webp','TTT Academy official DCET 2024 results poster',1);
INSERT INTO `results` (`year`,`best_rank`,`below_10`,`below_100`,`below_200`,`below_500`,`below_1000`,`below_1500`,`below_2000`,`poster`,`source_note`,`is_active`) VALUES (2023,1,4,23,41,98,173,234,289,'assets/img/posters/dcet-2023-rank-holders.webp','TTT Academy official DCET 2023 results poster',1);
INSERT INTO `results` (`year`,`best_rank`,`below_10`,`below_100`,`below_200`,`below_500`,`below_1000`,`below_1500`,`below_2000`,`poster`,`source_note`,`is_active`) VALUES (2022,8,NULL,14,NULL,69,NULL,NULL,NULL,'','TTT Academy published DCET 2022 results',1);

-- rankers
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,3,'','Keshavaram','Smt. L V Poly. Hassan',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,4,'','Poorna Tejas','Siddaganga, Tumkur',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,6,'','Faiz Ahmed','SMP Sagar',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,9,'','Yuktha Boomika','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,11,'','Meghana Rodd','KLSSVP Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,13,'','Adarsh G','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,25,'','Tejaswini P','GPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,28,'','B Shrivatshan','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,30,'','Akshay B','Smt. LVP Hassan',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,32,'','Akhilesh U','KPT Mangaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,33,'','Prasad G S','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,35,'','Jonathan S A','NMIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,38,'','Aditya R K','RNSP Sirsi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,39,'','Sanmaan M B','KLE\'s SIMP Hubli',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,42,'','Medha U G','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,44,'','Brijesh Gowda','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,46,'','Prajwal B G','GPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,53,'','M Rajareddy','BGS Chikkaballapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,54,'','K Shrihari','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,57,'','Nandan N M','MLBP Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,59,'','Abhishek P','SDMP Ujire',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,65,'','Brunda K A','SLVP Hassan',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,69,'','Sameeksha G B','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,71,'','Nuthan S Shetty','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,74,'','Mohammed M','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,76,'','Shreshtha G B','KLSSVP Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,77,'','Hrushikesh G','DSIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,81,'','Manyasri P','GPTI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,85,'','Madhusudhan','SPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,93,'','Syed Maaz','SPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,94,'','Madavan G S','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,97,'','Shashank T','RGMP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,101,'','Divya R','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,102,'','Suresh M N','GPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,104,'','Darshini K','NMIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,105,'','Gagana V','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,108,'','Yukthi S R','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,111,'','Arjun M','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,112,'','Syed Saad R','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,121,'','Nischal K','SPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,126,'','Tejaswini M','SPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,129,'','Sneha','GPT Gulbarga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,131,'','Venkatesh R G','BVVSP Bagalkot',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,135,'','Lalith Kumawat','MNIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,137,'','Aamira Kausar','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,141,'','Swetha U G','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,147,'','Suchitha M','BGS Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,150,'','Nikhilkumar','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,151,'','Dhanush C','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,152,'','Aikhya K','GPT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,153,'','Kavitha R','RJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,159,'','Sai Kiran S V','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,160,'','Gopinandan B R','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,168,'','Bhavana Jain','SBP Hassan',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,173,'','Pavan R V','RJSP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,175,'','Shamitha R','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,177,'','Poorvika S K','NMIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,179,'','Kashfiya Naaz','Sandur Polytechnic',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,180,'','Sujitha S','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,183,'','Sudarshan V H','RNSP Sirsi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,186,'','Aishwarya','GPT K R Pete',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,187,'','Mohammed A H','GPT Kalburgi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,188,'','Shreya','GPT Kalburgi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,192,'','Vinayak M N','MESP Sirsi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,193,'','Santhosh','SJPN Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,196,'','Jayanth Kumar','JSSP Mysuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,197,'','Maaz T C','KSP Mallasandra',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,200,'','Mohan Kumar','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,202,'','Vibha V B','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,203,'','M Sindhya','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,207,'','Adithya H A','SPT Thirthahalli',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,208,'','K Arthi','GPT Ballary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,211,'','L M Vinodhan','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,218,'','Darshan R V','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,225,'','Harshitha K G','GPT Hassan (D)',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,230,'','Ayaanahmed','GPT Kalaburgi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,234,'','Riya V P','AP Chikkamagaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,237,'','T M Lakshmi','BPS Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,240,'','Vineet A K','GPT Vijayapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,245,'','Mangala','GPT Ramanagara',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,251,'','Dharanish M','GTTC Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,253,'','Akshatha D K','GPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,256,'','Naveen S H','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,265,'','Deepika C V','BGSP Chikkaballapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,266,'','S Ramachandran','BGSP Chikkaballapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,268,'','Pavan K','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,271,'','Nandini','GPT Bidar',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,276,'','Rishi G S','BGSP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,279,'','Md. Shahrukh','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,280,'','Syed Zuber','GPT Channapattana',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,284,'','Archana A N','GPT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,285,'','Shounak N P','VSMP Nippani',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,292,'','Darshini K M','DRRP Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,298,'','B S Niranjan','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,300,'','Suhas S','BGSP Chikkaballapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,308,'','Sharath D C','DRRP Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,318,'','Shruthi','GRWPT Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,325,'','Kavana C K','MMP Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,328,'','Atharva Suhas','KELP Chikkodi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,329,'','D Bhavani','GPT Ballary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,332,'','Vidya H','GPT Raichuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,342,'','Sanjana N','DSIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,343,'','Hemanth P','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,349,'','Sharanabasappa','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,354,'','Chaithanya J','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,355,'','Daniya Shekh','GPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,359,'','Rithvik R','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,364,'','Mahammad Yusuf','MLBP Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,365,'','Rakshitha H E','SMP Sagar',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,368,'','Anil N L','BGSP Chikkaballapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,372,'','Mithun R','JSSP Nanjanagudu',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,375,'','P Abhishek','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,376,'','Chethan A','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,377,'','Lahari N A','GPT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,378,'','Shivanand M K','GPT Belagavi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,380,'','Ramya M S','GMITP Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,384,'','B Divya','GPT Ballary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,385,'','Shubhanga V M','AP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,392,'','Mallikarjuna C P','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,394,'','Srushti K B','GPT Athani',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,399,'','Mahalakshmi V','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,401,'','Pallavi T S','GPT Tiptur',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,403,'','Vinayaka K V','Bapuji Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2026,404,'','Sonika B S','DVSP Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,1,'','Abhigna H','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,4,'','Jashua Anish','CSIP Kanyakumari',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,8,'','Thanushree','NITTE P Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,10,'','Darshan Raj','Acharya Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,25,'','Tanvipriya','HKESP Kalburgi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,26,'','Ajay C','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,28,'','Ranjith R','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,29,'','Sachin R','Bapuji Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,35,'','Saivennela','NMIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,36,'','Surendra H J','JSS Mysuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,41,'','Nagavallabha','Smt. L.VP Hassan',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,42,'','Ankitha A','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,45,'','Shakunthala P S','GWP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,47,'','Arbaz Ansari','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,50,'','Shivaraj M','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,53,'','Monika K N','GTTC Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,59,'','Nandhini B C','GPT Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,61,'','Uvika S','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,62,'','Nishchith N','SKP Ramanagara',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,64,'','F Joseph','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,65,'','Hemanth','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,72,'','Bhuvan Raj H','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,76,'','Shivani R M','Bapuji Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,79,'','Rakshitha S','GWP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,84,'','Pruthvi Kiran','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,87,'','Rohan','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,95,'','Srinivas B','SPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,96,'','Jeevan R','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,103,'','Yogesh H','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,104,'','Tejas V','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,107,'','Divyashree N','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,109,'','Manasa K','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,110,'','Chandana V','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,111,'','Nandi H C','GWP Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,114,'','Roopashree S','Vasavi Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,115,'','Raj Ashish Patel','Acharya Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,119,'','Ruchitha B','GPT Bellary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,122,'','Gagan M','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,125,'','Tejashwini S','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,131,'','Shashank T M','GPT Channapatna',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,132,'','Rohith V','SPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,134,'','Akshay N M','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,137,'','Nithya S','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,143,'','Chethan H A','JSS Mysuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,147,'','Krish Kumar','SGP Bellary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,151,'','Chaithanya J','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,153,'','Thippesh B N','GTTC Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,170,'','Aishwarya C','MEIP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,173,'','Kari Bhavitha','Sandur Polytechnic',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,176,'','Manoj R','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,177,'','Shreyan Ganesh','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,178,'','Swathi M S','Sandur Polytechnic',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,184,'','Amith Gowda','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,185,'','Monish A','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,189,'','Chirag B C','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,192,'','Manas R','MSRP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,203,'','Saniya Andagi','GTTC Gokak',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,204,'','Dhanush M S','G CPCP Mysuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2025,210,'','Karthik K S','GTTC Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,3,'','Manohar D S','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,8,'','Lekhan C','VISSJ Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,11,'','Suhas Shetty','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,12,'','Pavana B V','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,17,'','Disha A','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,18,'','T Sai Deepthi','HEA Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,20,'','Abhishek H G','SDM Ujire',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,21,'','Sounjna Bhat','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,21,'G55','Chethan Gowda','NTTF Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,24,'','Punith B R','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,25,'','Akanksha N','Bapuji Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,30,'','Reddy Sai Nivas','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,40,'','Shilpa G','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,55,'','Monisha H L','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,56,'','Gowtham H A','DSDP Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,61,'','Harshitha Nayak','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,63,'','Flavian F Joseph','MSRIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,64,'','Trisha D','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,66,'','Vinay V','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,72,'','Abhishek S','JSS Mysuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,76,'','Sagar E L','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,85,'','Dhanush K','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,86,'','Shravan M S','Bapuji Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,87,'','Navya G','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,91,'','Yogaraj V','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,94,'','Bhuvan A','East West Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,99,'','Mithun G','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,104,'','Gayathri S','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,107,'','Parinika S','HEA Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,116,'','Prashanth','SDM Ujire',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,127,'','Abhay N Y','PES Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,128,'','Vidyashree V','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,135,'','Shreenanda S','GPT Chitradurga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,138,'','Sai Aakanksha','Bapuji Davanagere',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,142,'','Sunaina Babu U','GWP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,144,'','Harshitha G','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,146,'','Samruddhi Jirli','SRVRP Guledagudda',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,149,'','Yasin Suhail','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,155,'','Abhishek Kotyal','GPT',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,157,'','Ashwini L','GWP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,159,'','Vipul Reddy','MSRIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,161,'','Sagar Kagi','KLE Mahalingapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,172,'','Jayashree G','HEA Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,175,'','Prajwal K S','DSDP Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,177,'','Sumathi C','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,183,'','Bhumi','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,188,'','Manali','GPT Bidar',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,198,'','Kallesh J','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,199,'','R V Kirthana','Acharya Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,208,'','Priyadarshini','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,211,'','Vanaja E','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,217,'','Chandan K M','GPT Tumkur',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,222,'','Lokesh Gowda','BETP KM Doddi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,227,'','Darshan Gowda','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,243,'','Dikshith S','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,245,'','Akash G S','GPT Channapattana',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,248,'','Anant Ganapathi','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,249,'','Disha C','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2024,255,'','Meghana U','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,1,'','Santhrupth H R','GTTC Gouribidanur',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,7,'','Srujan','BLDEA Vijayapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,8,'','Gopinath','SJPN Nidasoshi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,10,'','Chandana','SP Ramanagara',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,19,'','Bindu S','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,25,'','Raghavendra','GPT Kalburgi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,28,'','Vivitha Sequeira','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,31,'','Zhenkar Gowda','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,38,'','Somashekara','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,50,'','Punith Giri B T','GPT Hosadurga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,54,'','Gokulnath S','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,62,'','Hemalatha S','GPT Chitradurga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,64,'','Harshith','Acharya Poly.',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,70,'','Vaibhav D','GPT Hiriyur',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,75,'','Balaraj S A','GPT Channapattana',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,80,'','Siddu R','BVVSP Hosapete',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,83,'','Harshavardhan','SJPN Nidasoshi',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,90,'G55','Shashank','VISSJ Shivamogga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,90,'','B Girish','SGP Bellary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,98,'','Chandana B','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,107,'','Karthik G','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,111,'','Om Shivarjun','SSPT Tumakuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,115,'','Chandrashekar M','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,117,'','Shivakumar S','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,119,'','Yashwanth P','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,144,'','Amol Girigowda','VSMSRKIT Nippani',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,146,'','Sai Charan K','SGP Bellary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,150,'','Veeresh','BVVS Bagalkot',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,157,'','Afnan Pasha','SJBGS Bellur Cr.',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,158,'','Praful Gowda','GPTI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,160,'','Hemavathi V M','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,161,'','Kalpitha R B','SVP Kumta',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,165,'','Jeevan G M','GPT Bellary',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,166,'','Krishna N','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,169,'','Chandan T S','NTTF Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,171,'','Punithkumar C','GPT Chitradurga',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,176,'','Nandhini P','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,186,'','Akhilandeshwari','KVT Chikkaballapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,190,'','Shamanth','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,192,'','Sweta','JNP Kushnoor',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,203,'','Dharshan M','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,205,'','Nandini A','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,212,'','Lokesh N','HEA Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,215,'','Mahantesh K','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,218,'','Sadath Khan','GPT Chintamani',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,219,'','Gayana R','APS Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,228,'','Arun Kumar','GPT Vijayapura',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,239,'','Sanjana','NMIT Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,247,'','Chethan C R','HEA Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,249,'','Santhosh S','APS Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,250,'','Prajna B','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,253,'','Ravikanth','GPT Bidar',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,270,'','Channappa','GPT Bidar',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,273,'','Ekanth Gowda','VVP Mysuru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,285,'','Udayshankar C A','PVP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,291,'','Gokul G','SJP Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,292,'','Hemanth Kumar T','GPT K R Pete',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,297,'','Nikhil G','MEI Bengaluru',1);
INSERT INTO `rankers` (`year`,`rank_no`,`category`,`name`,`college`,`is_active`) VALUES (2023,298,'','Balaji S','MEI Bengaluru',1);

-- admissions
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('RV College of Engineering',68,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('MS Ramaiah Institute of Technology',44,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('BMS College of Engineering',42,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('PES University',26,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('Dayananda Sagar College of Engineering',25,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('Siddaganga Institute of Technology, Tumakuru',21,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('UVCE Bengaluru',19,1);
INSERT INTO `admissions` (`college`,`students`,`is_active`) VALUES ('NIE Mysuru',17,1);

-- testimonials
INSERT INTO `testimonials` (`name`,`title`,`year`,`quote`,`photo`,`sort_order`,`is_active`) VALUES ('Santhrupth H R','DCET 2023 · State 1st Rank',2023,'TTT Institution has provided excellent guidance for DCET preparation, ensuring my success and securing 1st rank in Karnataka State. I am also thankful to my friends who played a crucial role in helping me achieving this milestone. Special gratitude to Savin Sir and the dedicated team for their effective online coaching classes. The regular mock tests helps us identify and rectify our mistake and with no doubt TTT Institution has helped many students across Karnataka to secure good ranking in DCET by providing both online and offline classes with well-equipped classroom, study material and infrastructure.','assets/img/toppers/2023-santhrupth-h-r.webp',1,1);
INSERT INTO `testimonials` (`name`,`title`,`year`,`quote`,`photo`,`sort_order`,`is_active`) VALUES ('Abhigna H','DCET 2025 · State 1st Rank',2025,'Securing the state first rank feels surreal, I owe this moment to TTT Academy that stood by me throughout this journey. The dedication of faculties and the smart study strategies and the constant support and motivation created a perfect study environment for effective learning. The study materials provided were well-structured, comprehensive and perfectly aligned with the exam pattern, making preparation efficient and focused. Thanks again to TTT Academy for turning potential into performance and guiding me to this achievement.','assets/img/toppers/2025-abhigna-h.webp',2,1);
INSERT INTO `testimonials` (`name`,`title`,`year`,`quote`,`photo`,`sort_order`,`is_active`) VALUES ('Manohar D S','DCET 2024 · State 3rd Rank',2024,'The infrastructure and classes were all good and well guided, good teaching facilities. Overall had a good experience and now pursuing my BE(CSE) at RVCE.','assets/img/toppers/2024-manohar-d-s.webp',3,1);
INSERT INTO `testimonials` (`name`,`title`,`year`,`quote`,`photo`,`sort_order`,`is_active`) VALUES ('Srujan Buddar','DCET 2023 · State 7th Rank',2023,'I have been in this Institution for more than 2 years, and in my life especially in studies, I have been improved a lot. Teachers are more supportive & interactive. Since the day I joined this T.T.T Academy & till now my studies are getting better day by day. I really thank T.T.T Academy for being with me, and I wish all the best for teachers for their future.','assets/img/toppers/2023-srujan.webp',4,1);
INSERT INTO `testimonials` (`name`,`title`,`year`,`quote`,`photo`,`sort_order`,`is_active`) VALUES ('Shravan','DCET student',NULL,'Technical Teaching and Training Academy is an excellent institution for me since it allows us to learn extensively, increase our D-CET exam marks, and do well in practice exams. Well committed structure of classes for competitive exams from T.T.T Academy make us to score good rank in our CET exam.','',5,1);

-- videos
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('dg900VJAC0M','Study Tips from the D-CET 2023 State Topper','topper',1,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('7lWNlIJN8mw','Study Tips from the D-CET 2024 State 3rd Topper','topper',2,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('YlCvPjNIXeQ','D-CET 2024 11th Rank — scored through online classes','topper',3,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('o_Le8oee80o','D-CET 2025: RVCE with 61st rank — hear directly from Uvika','topper',4,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('tgz-xSLhvfA','DCET 2025 State 25th Rank — parents’ honest feedback','testimonial',5,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('HtkKYukvaU0','Struggles, Stress & Success — real D-CET 25 stories of TTT students','testimonial',6,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('ZKrrbFB-zMg','DCET 2025 student feedback','testimonial',7,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('bQg7p2MDEcE','DCET 2025 student feedback (part 2)','testimonial',8,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('ocY1yoaruq0','What D-CET students say about TTT Academy','testimonial',9,1);
INSERT INTO `videos` (`youtube_id`,`title`,`category`,`sort_order`,`is_active`) VALUES ('cJVzwoV1uuQ','Crack DCET with Rank 1 — complete Jnana Batch details & study plan','course',10,1);

-- faculty
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Dr. Savina J.P','Chairman · DCET mentor','B.E, M.E, Ph.D','“Education is the first stepping stone to an open mind, a life of dignity and growth of each individual and humankind at large.” Technical Teaching & Training Academy opens its doors for those with a passion for learning and provides a platform to gear students to be focused and successful individuals of tomorrow. In our academy, you will be guided by experienced and dedicated faculties, who are trained to help students resolve both academic and personal difficulties.','leadership','assets/img/team/chairman.webp',1,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Mr. Puttaswamy J.D','Founder','','Education makes a person face new challenges, achieve goals and lead a successful life. I would like to encourage all students to acquire the right education. I strongly believe in my spirited staff members’ capacity to build up our future generation with sound knowledge and good exposure in this competitive world.','leadership','assets/img/team/founder.webp',2,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Mr. Rakesh Roshan S','President','M.Sc (Gold Medalist), M.B.M (UK)','“The sun may not rise tomorrow, the seas may stop flowing, but you my student don’t stop — because knowledge with you will last forever.” Strive for knowledge, because nothing else is eternal in life.','leadership','assets/img/team/president.webp',3,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Mrs. Chaitanya P.S','Secretary','B.E','“Where there is quality education, there is quality life.” To be successful in life, have ambitions and define your goals clearly. Discipline and hard work are the key to success. Be regular in classes and focus on your goals.','leadership','assets/img/team/secretary.webp',4,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Mr. Dhananjay','Manager','B.E','','administration','assets/img/team/dhananjay.webp',10,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Ms. Pallavi','Manager','BA, B.Ed','','administration','assets/img/team/pallavi.webp',11,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Chandrashekhar C.M','Computer Science','B.E, M.Tech','Academician with 9 years of teaching experience. Specialisation in Computer Science.','academic','',20,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Ramchandiran','Electronics & Mathematics','B.E','Academician with 4 years of teaching experience. Specialisation in Electronics & Mathematics.','academic','',21,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Sunil H.C','Statistics','B.Com, M.Com','Academician with 7 years of teaching experience. Specialisation in Statistics.','academic','',22,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Bindya B.H.P','Accounts','M.B.A, M.F.A','Academician with 9 years of teaching experience. Specialisation in Accounts.','academic','',23,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Sanjeeva Murthy','Economics & Social Science','M.A, B.Ed','Academician with 18 years of teaching experience. Specialisation in Economics & Social Science.','academic','assets/img/team/faculty-5.webp',24,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Rahmath Unnisa','Hindi','B.A, B.Ed','Academician with 18 years of teaching experience. Specialisation in Hindi.','academic','assets/img/team/faculty-6.webp',25,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Pallavi C','Kannada','B.A, B.Ed','Academician with 6 years of teaching experience. Specialisation in Kannada.','academic','assets/img/team/faculty-7.webp',26,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Manjula Bai','Social Science','B.A, B.Ed','Academician with 8 years of teaching experience. Specialisation in Social Science.','academic','assets/img/team/faculty-8.webp',27,1);
INSERT INTO `faculty` (`name`,`role`,`qualification`,`bio`,`member_group`,`photo`,`sort_order`,`is_active`) VALUES ('Vijayalakshmi','English','B.A, B.Ed','Academician with 15 years of teaching experience. Specialisation in English.','academic','',28,1);

-- gallery
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('T.T.T Academy campus building','assets/img/gallery/39.webp','campus',1,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Smart classroom with projector','assets/img/gallery/41.webp','campus',2,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Spacious classroom','assets/img/gallery/42.webp','campus',3,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Classroom with whiteboard','assets/img/gallery/45.webp','campus',4,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Lecture hall','assets/img/gallery/46.webp','campus',5,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Classroom','assets/img/gallery/40.webp','campus',6,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Reception and library corner','assets/img/gallery/44.webp','campus',7,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Students during a smart-board session','assets/img/gallery/14.webp','classes',8,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Full classroom of DCET aspirants','assets/img/gallery/12.webp','classes',9,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Students in class','assets/img/gallery/13.webp','classes',10,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Interactive class discussion','assets/img/gallery/37.webp','classes',11,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Students sharing their views','assets/img/gallery/10.webp','classes',12,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Student group at T.T.T','assets/img/gallery/43.webp','classes',13,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Students and faculty group photo','assets/img/gallery/15.webp','events',14,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Felicitation ceremony','assets/img/gallery/16.webp','events',15,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Felicitation at T.T.T Academy','assets/img/gallery/30.webp','events',16,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Teachers’ Day celebration','assets/img/gallery/31.webp','events',17,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Independence Day celebration','assets/img/gallery/33.webp','events',18,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Cultural performance','assets/img/gallery/34.webp','events',19,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Classical dance performance','assets/img/gallery/35.webp','events',20,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Celebration with students','assets/img/gallery/36.webp','events',21,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Children’s Day prize distribution','assets/img/gallery/6.webp','events',22,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Prize distribution','assets/img/gallery/5.webp','events',23,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Student speech','assets/img/gallery/11.webp','events',24,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('T.T.T Publications book launch','assets/img/gallery/gallery_2.webp','events',25,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('T.T.T Publications event','assets/img/gallery/gallery_1.webp','events',26,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Kargil Vijay Diwas tribute','assets/img/gallery/32.webp','events',27,1);
INSERT INTO `gallery` (`title`,`image`,`category`,`sort_order`,`is_active`) VALUES ('Science exhibition','assets/img/gallery/1.webp','events',28,1);

-- materials
INSERT INTO `materials` (`title`,`description`,`category`,`file`,`access`,`sort_order`,`is_active`) VALUES ('DCET Syllabus & Previous Year Question Book','Complete DCET syllabus with previous year question papers, compiled by T.T.T Academy.','pyq','https://tttacademics.com/blogs_docs/DCET-26%20Syllabus%20%26%20PYQ%20Book.pdf','public',1,1);
INSERT INTO `materials` (`title`,`description`,`category`,`file`,`access`,`sort_order`,`is_active`) VALUES ('How Toppers Calculate DCET Ranks','Detailed DCET rank-holder results and how DCET ranks are calculated.','guide','https://tttacademics.com/blogs_docs/How%20Top%20Calculate%20DCET%20Ranks.pdf','public',2,1);

-- syllabus
INSERT INTO `syllabus` (`subject`,`short`,`marks`,`topics`,`tip`,`sort_order`,`is_active`) VALUES ('Engineering Mathematics','Maths',20,'["Matrices & determinants","Straight lines","Trigonometry","Differential calculus & its applications","Integral calculus & its applications"]','Practise unit-wise MCQs daily — speed in Maths frees up time for the rest of the paper.',1,1);
INSERT INTO `syllabus` (`subject`,`short`,`marks`,`topics`,`tip`,`sort_order`,`is_active`) VALUES ('Statistics & Analytics','Stats',20,'["Collection & representation of data","Measures of central tendency","Measures of dispersion","Correlation & regression","Probability basics","Data analysis with spreadsheets"]','Most questions are formula-driven. Keep a one-page formula sheet and revise it every week.',2,1);
INSERT INTO `syllabus` (`subject`,`short`,`marks`,`topics`,`tip`,`sort_order`,`is_active`) VALUES ('IT Skills','IT',20,'["Computer fundamentals & operating systems","Office productivity tools","Internet, web & e-mail basics","Algorithms & flowcharts","Programming fundamentals"]','Concept-based and quick to score — revise with short notes and previous year questions.',3,1);
INSERT INTO `syllabus` (`subject`,`short`,`marks`,`topics`,`tip`,`sort_order`,`is_active`) VALUES ('Fundamentals of Electrical & Electronics Engineering','FEEE',20,'["Electric circuits & laws","AC fundamentals","Electrical machines & transformers","Semiconductor devices","Digital electronics basics","Electrical safety"]','Common to every branch — focus on numericals around circuit laws and AC quantities.',4,1);
INSERT INTO `syllabus` (`subject`,`short`,`marks`,`topics`,`tip`,`sort_order`,`is_active`) VALUES ('Project Management Skills','PMS',20,'["Project concepts & life cycle","Planning & scheduling","Cost & resource management","Risk & quality management","Teamwork, communication & leadership"]','Theory-heavy — learn definitions and key terms precisely; OMR mock tests help most here.',5,1);

-- faqs
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('What is DCET?','The Diploma Common Entrance Test (DCET) is a state-level entrance exam conducted by the Karnataka Examinations Authority (KEA) for diploma holders seeking lateral entry (direct 2nd year) admission to B.E./B.Tech programmes in Karnataka, and 1st year architecture.','exam',1,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('What is the DCET exam pattern?','100 multiple-choice questions across 5 subjects (Engineering Mathematics, Statistics & Analytics, IT Skills, FEEE and Project Management Skills — 20 marks each). The exam is offline (OMR-based), lasts 3 hours, and carries +1 for each correct answer with no negative marking. The medium is English.','exam',2,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('How many attempts are allowed?','There is no official limit on DCET attempts.','exam',3,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('Can diploma students from other states apply?','Only Karnataka diploma holders are eligible for government seats. Others may apply for management quota.','exam',4,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('How is the DCET rank calculated?','Diploma percentage is derived from CGPA as (CGPA − 0.75) × 10. The score used for ranking is 50% of the diploma percentage plus 50% of the DCET marks. Try our free DCET Rank Predictor to estimate your rank range.','exam',5,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('What are the batch timings?','For the Jnana Batch: at the Peenya branch, Morning (B-1) runs 06:30 AM – 9:00 AM and Evening (B-1) runs 6:00 PM – 8:30 PM. At the Hesaraghatta branch, Evening (B-2) runs 6:30 PM – 9:00 PM. The Weekend Batch at Peenya meets Fri & Sat 6:00 PM – 8:00 PM and Sun 10:00 AM – 2:00 PM. Pratigna and Pragathi timings (Morning / Evening / Weekend) are confirmed at admission counselling.','coaching',6,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('Is there free entry for the Crash Course?','Yes. Jnana Batch students get free entry to the Crash Course after 6th sem.','coaching',7,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('Can I attend classes online?','Yes. Our Hybrid Class System offers offline classroom learning, online live classes and recorded classes with 24×7 access (available after every live session, if recorded). Attendance is tracked by our AI-based system for both online and offline classes.','coaching',8,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('When do I get my TTT Student Panel login?','Panel and login details are shared after admission confirmation, along with your orientation schedule and the complete test calendar for your batch.','admission',9,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('How do I get the QR admission discount?','Purchase our DCET book, scan the QR code on the cover page, and you get an instant discount from T.T.T Academy. Save the screenshot and show it while getting admission.','admission',10,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('Is accommodation available for outstation students?','Yes. Separate PG facilities for boys and girls are available near the academy, with onboarding support for parents and students.','admission',11,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('Are there cash prizes for toppers?','Yes. For DCET 2027, T.T.T Academy rewards the State 1st rank holder with ₹1,00,000 and the State 2nd rank holder with ₹50,000.','admission',12,1);
INSERT INTO `faqs` (`question`,`answer`,`category`,`sort_order`,`is_active`) VALUES ('Is coaching necessary?','Self-study is possible, but coaching gives you an edge with expert guidance, structured revision and regular mock tests.','coaching',13,1);

-- branches
INSERT INTO `branches` (`name`,`address`,`phone`,`email`,`map_embed`,`sort_order`,`is_active`) VALUES ('Branch 1 · Peenya','No. 8, 1st Floor, Opp. MEI Colony Bus Stop, Peenya 3rd Phase, Bengaluru – 560058','+91 99868 69955 / 10','tttinstitution@gmail.com','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.2499507788207!2d77.5179755758423!3d13.019748613819269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3d5b9788ddff%3A0x80923d84f06b4819!2sT%20T%20T%20Academy!5e0!3m2!1sen!2sin!4v1737619245488!5m2!1sen!2sin',1,1);
INSERT INTO `branches` (`name`,`address`,`phone`,`email`,`map_embed`,`sort_order`,`is_active`) VALUES ('Branch 2 · T-Dasarahalli (Hesaraghatta Road)','No. 11, 1st Floor, Hesaraghatta Main Road, Near Bagalagunte Signal, T-Dasarahalli, Bengaluru – 560073','+91 99868 69970 / 77','tttinstitution@gmail.com','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6751043422028!2d77.50370121081802!3d13.056340612961304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae232414aa391f%3A0x59f661a37bb64ddd!2sT%20T%20T%20Academy%20Branch%20III%20(%20Hesarghatta%20Main%20Road%20Branch)!5e0!3m2!1sen!2sin!4v1744873052057!5m2!1sen!2sin',2,1);
INSERT INTO `branches` (`name`,`address`,`phone`,`email`,`map_embed`,`sort_order`,`is_active`) VALUES ('Branch 3 · Magadi Road','No. 11, 1st Floor, Maruthi Complex, Opp. Ravinandana Palace, Magadi Main Road, Bengaluru – 560091','+91 99868 69953 / 63','tttinstitution@gmail.com','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.756937136296!2d77.47345867584579!3d12.987392187329466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3d835dde25cd%3A0x15a4b49f6d6bfa5e!2sTTT%20ACADEMY%20MAGADI%20MAIN%20ROAD!5e0!3m2!1sen!2sin!4v1789367494291!5m2!1sen!2sin',3,1);

-- settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('phone_primary', '+91 99868 69966');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('phone_admission', '+91 99868 69955');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('whatsapp', '919986869955');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('email', 'info@tttacademics.com');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('email_branches', 'tttinstitution@gmail.com');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('address', '#8, MEI Colony, Peenya 3rd Phase, Bengaluru - 560058');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('instagram', 'https://www.instagram.com/ttt_academy_coaching/');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('youtube', 'https://www.youtube.com/@tttacademy1');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('linkedin', 'https://www.linkedin.com/in/t-t-t-academy-54990a176/');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('app_android', 'https://play.google.com/store/apps/details?id=co.diy17.uxsoa');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('app_ios', 'https://apps.apple.com/in/app/classplus/id1324522260');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('student_panel', 'https://tttacademy.in/JnanBot/user/login');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('publications', 'https://www.tttpublications.com');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('admission_year', 'DCET 2027');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('hero_video', '');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('prize_first', '₹1,00,000');
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('prize_second', '₹50,000');

