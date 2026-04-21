## Overview

The CPU Scheduling Visualizer allows users to input custom processes and simulate how various scheduling algorithms handle them. It provides graphical representations (Gantt charts), step-by-step execution, and performance metrics like waiting time and turnaround time.

This project is especially useful for:

1. Students learning Operating Systems

2. Anyone who wants a visual understanding of scheduling logic


## Features

### Supported Algorithms

1. FCFS (First Come First Serve)
2. SJF (Shortest Job First - Non-preemptive)
3. SRTF (Shortest Remaining Time First - Preemptive)
4. Round Robin (RR)
5. Priority Scheduling


### Process Input

- Add multiple processes dynamically
- Input fields:
   - Process ID
   - Arrival Time
   - Burst Time
   - Priority (if required)
- Remove/edit processes easily
- Time Quantum input for Round Robin


### Visualization

- Dynamic Gantt Chart
- Real-time execution timeline
- Highlights currently running process
- Displays CPU idle time (if applicable)


### Performance Metrics

For each process:

- Completion Time
- Waiting Time
- Turnaround Time

Overall:

- Average Waiting Time
- Average Turnaround Time


## How It Works

1. User inputs processes with arrival & burst times
2. Selects a scheduling algorithm
3. Clicks Run Simulation
4. The selected algorithm processes the input data
5. The system:
   - Generates execution order
   - Calculates metrics
   - Displays results visually

Each algorithm is implemented as a separate function, making the system modular and easy to extend.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Run the app:
   `npm run dev`
