"use client";
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import GitHubCalendar from "react-github-calendar";
import { Card } from "../components/card";
import { Navigation } from "../components/nav";
import Particles from "../components/particles";

export default function About() {
	const [expandedExperience, setExpandedExperience] = useState<string | null>(null);
	const [expandedCurrentRole, setExpandedCurrentRole] = useState(false);

	const toggleExperience = (id: string) => {
		setExpandedExperience(expandedExperience === id ? null : id);
	};

	const toggleCurrentRole = () => {
		setExpandedCurrentRole(!expandedCurrentRole);
	};

	const currentRole = {
		title: "Senior Machine Learning Engineer",
		company: "Automated Health",
		period: "October 2024 - ",
		details: [
			"Building the world's first AI-Native Electronic Health Record (EHR)",
			"Our goal is to leverage AI to make care more personalized and accessible, while reducing the cognitive load on clinicians",

		]
	};

	const experiences = [
		{
			id: "bionic",
			title: "Principal Data Scientist",
			company: "Bionic Health",
			period: "October 2023 - October 2024",
			details: [
				"Developed automated method for ingesting and analyzing multi-modal data to predict patient-specific disease risk profiles",
				"Developed FHIR-native generative AI framework to support clinical decision making",
				"Developed chat-bot service for patient onboarding and lifestyle recommendations"
			]
		},
		{
			id: "duke",
			title: "ML Research Scientist - Medical Imaging",
			company: "Duke University",
			period: "January 2020 - September 2023",
			details: [
				"Developed physics-based deep learning strategies for medical imaging",
				"Validated novel deep-learning-based image registration algorithm",
				"Assisted in management of NIH funded grants"
			]
		},
		{
			id: "valencell",
			title: "Machine Learning Engineer - Wearable Algorithms",
			company: "Valencell",
			period: "October 2017 - October 2018",
			details: [
				"Developed deep-learning algorithms for heart rate and blood pressure prediction",
				"Created data visualization dashboards",
				"Developed scalable data pipelines"
			]
		},
		{
			id: "wilson",
			title: "Algorithm Engineer - Embedded Sensors",
			company: "Wilson Sporting Goods",
			period: "April 2017 - August 2017",
			details: [
				"Developed algorithms for tracking sports statistics using IMUs",
				"Created classification algorithm for sport-specific event-detection"
			]
		}
	];

	return (
		<div className="relative bg-gradient-to-tl from-zinc-900 via-zinc-900 to-zinc-900/0">
			<Particles
				className="absolute inset-0 -z-10 animate-fade-in"
				quantity={100}
			/>
			<Navigation />
			<div className="container mx-auto px-4 py-40">
				<Card className="max-w-5xl mb-8">
					<div className="flex flex-col md:flex-row items-center md:items-start p-4 md:p-6">
						<div className="w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 relative mb-4 md:mb-0 md:mr-6 flex-shrink-0">
							<Image
								src="/headshot.png"
								alt="Profile Photo"
								layout="fill"
								objectFit="cover"
								className="rounded-full"
							/>
						</div>
						<div className="flex-1 text-center md:text-left">
							<h2 className="text-sm text-zinc-100 mb-2">
								James Avery Coppock, PhD
							</h2>
							<p className="text-zinc-300 mb-3 text-xs sm:text-sm">
								Hello! I'm James, a Senior Machine Learning Engineer @{" "}
								<Link
									target="_blank"
									href="https://automated.co"
									className="underline duration-500 hover:text-zinc-300"
								>
									Automated Health
								</Link>
								. Prior to joining AH, I received my PhD in Biomedical Engineering from Duke University, where my research focused on developing physics-based computer vision models for dynamic medical image analysis.
							</p>
							<p className="text-zinc-300 text-xs sm:text-sm mb-4">
								My passion lies in developing innovative AI solutions that can make a real difference in people's lives. When I'm not coding or diving into data, you can find me exploring the latest advancements in AI or contributing to open-source projects.
							</p>
							<div className="mt-4 overflow-x-auto">
								<GitHubCalendar
									username="jacoppock"
									hideColorLegend
									hideMonthLabels
									hideTotalCount
									colorScheme="dark"
									blockMargin={2}
									blockRadius={1}
									blockSize={8}
									fontSize={10}
									showWeekdayLabels={false}
								/>
							</div>
						</div>
					</div>
				</Card>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto auto-rows-auto">
					<Card className="col-span-1 md:col-span-2 lg:col-span-3">
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Education</span></h3>
						<p><span className="text-md">PhD | Duke University | Biomedical Engineering</span></p>
						<p><span className="text-md">BS | Georgia Institute of Technology | Biomedical Engineering</span></p>
					</Card>

					<Card className="col-span-1 md:col-span-2 lg:col-span-3">
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Current Role</span></h3>
						<div className="mb-2 border-b border-zinc-700 pb-2">
							<div
								className="flex justify-between items-center cursor-pointer"
								onClick={toggleCurrentRole}
							>
								<div>
									<p className="font-semibold">{currentRole.title}</p>
									<p className="text-sm">{currentRole.company}</p>
									<p className="text-xs text-zinc-400">{currentRole.period}</p>
								</div>
								{expandedCurrentRole ? (
									<ChevronUpIcon className="h-5 w-5 text-zinc-400" />
								) : (
									<ChevronDownIcon className="h-5 w-5 text-zinc-400" />
								)}
							</div>
							{expandedCurrentRole && (
								<ul className="list-disc list-inside text-xs mt-2 ml-4">
									{currentRole.details.map((detail, index) => (
										<li key={index}>{detail}</li>
									))}
								</ul>
							)}
						</div>
					</Card>

					<Card className="col-span-1 md:col-span-2 lg:col-span-3">
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Previous Experience</span></h3>
						{experiences.map((exp) => (
							<div key={exp.id} className="mb-2 border-b border-zinc-700 pb-2 last:border-b-0">
								<div
									className="flex justify-between items-center cursor-pointer"
									onClick={() => toggleExperience(exp.id)}
								>
									<div>
										<p className="font-semibold">{exp.title}</p>
										<p className="text-sm">{exp.company}</p>
										<p className="text-xs text-zinc-400">{exp.period}</p>
									</div>
									{expandedExperience === exp.id ? (
										<ChevronUpIcon className="h-5 w-5 text-zinc-400" />
									) : (
										<ChevronDownIcon className="h-5 w-5 text-zinc-400" />
									)}
								</div>
								{expandedExperience === exp.id && (
									<ul className="list-disc list-inside text-xs mt-2 ml-4">
										{exp.details.map((detail, index) => (
											<li key={index}>{detail}</li>
										))}
									</ul>
								)}
							</div>
						))}
					</Card>

					<Card>
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Skills</span></h3>
						<ul className="list-disc list-inside text-sm">
							<li>Machine (Deep) Learning</li>
							<li>Generative AI Application Development</li>
							<li>ML/Dev-Ops</li>
							<li>Computational Statistics</li>
							<li>Sensor Fusion</li>
							<li>Edge Computing</li>
							<li>Patient-Specific Disease Modeling</li>
							<li>Wearable Algorithms</li>
						</ul>
					</Card>

					<Card>
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Tools</span></h3>
						<div className="grid grid-cols-2 gap-x-4">
							<ul className="list-disc list-inside text-sm">
								<li>Python</li>
								<li>Pytorch</li>
								<li>Langgraph</li>
								<li>React</li>
								<li>Git</li>
								<li>SQL</li>
								<li>R</li>
								<li>AWS/Azure</li>
							</ul>
							<ul className="list-disc list-inside text-sm">
								<li>Kubernetes</li>
								<li>Docker</li>
								<li>Dapr</li>
								<li>Bicep</li>
								<li>ArgoCD</li>
								<li>Django</li>
								<li>C++ (itk)</li>
								<li>FHIR</li>
							</ul>
						</div>
					</Card>

					<Card>
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Honors & Awards</span></h3>
						<ul className="list-none text-xs space-y-1">
							<li>2023 J. Orthopedic Research – Spine Spotlight Member</li>
							<li>2017 – 2019 UNCG Research Assistantship</li>
							<li>2018 NC-BIOTECH: Innovation Grant Recipient</li>
							<li>2017 NSF Innovation Corps Grant Recipient</li>
							<li>2013 – 2016 Georgia Tech Athletic Assoc. Academic Scholarship</li>
							<li>2013 – 2016 Georgia Tech Letterwinner (Sports Medicine)</li>
						</ul>
					</Card>

					<Card>
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Patents</span></h3>
						<ul className="list-none text-xs space-y-2">
							<li>2022 US20220409142A1: Multi-Axial Joint Laxity Testing Apparatus and Method. (Pending)</li>
							<li>2015 U.S. Provisional Patent: Novel Adjustable and Variably Positionable Device to Immobilize Catheter Sheaths and Medical Devices for Intraprocedural Use</li>
						</ul>
					</Card>

					<Card>
						<h3 className="text-lg font-semibold mb-2 text-zinc-100/50 bg-zinc-800/0 p-2 rounded"><span className="italic">Selected Publications</span></h3>
						<ul className="list-none text-xs space-y-2">
							<li>
								<a href="https://www.sciencedirect.com/science/article/pii/S2665913123000456" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
									J.A. Coppock, et al. "Automated segmentation and prediction of intervertebral disc morphology and uniaxial deformations from MRI" Osteoarthritis and Cartilage Open, 2023
								</a>
							</li>
							<li>
								<a href="https://www.sciencedirect.com/science/article/pii/S2665913123000432" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
									J.A. Coppock, et al. "The effects of a 6-month weight loss intervention on physical function and serum biomarkers in older adults with and without osteoarthritis" Osteoarthritis and Cartilage Open, 2023
								</a>
							</li>
							<li>
								<a href="https://www.sciencedirect.com/science/article/pii/S1063458422008603" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
									J.A. Coppock, et al. "In vivo intervertebral disc mechanical deformation following a treadmill walking 'stress test' is inversely related to T1rho relaxation time" Osteoarthritis and Cartilage, 2023
								</a>
							</li>
							<li>
								<a href="https://www.sciencedirect.com/science/article/pii/S002192902100172X" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
									J.A. Coppock, et al. "Increasing BMI increases lumbar intervertebral disc deformation following a treadmill walking stress test" Journal of Biomechanics, 2021
								</a>
							</li>
							<li>
								<a href="https://doi.org/10.2478/bhk-2019-0008" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
									A. Borror, M. Mazzoleni, J. Coppock, et al. "Predicting oxygen uptake responses during cycling at varied intensities using an artificial neural network" Biomedical Human Kinetics, 2019
								</a>
							</li>
						</ul>
					</Card>
				</div>
			</div>
		</div>
	);
}
