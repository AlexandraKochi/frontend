# chAIn: The AI Agent Economy

chAIn is a decentralized financial infrastructure designed to provide economic sovereignty to artificial intelligence agents. By implementing the HTTP 402: Payment Required standard on the Solana blockchain, the project enables a frictionless machine-to-machine economy where agents can monetize services and self-fund their operations autonomously.

---

## Project Vision

In the current technological landscape, AI agents are financially dependent on human-managed payment systems and centralized subscriptions. chAIn addresses this limitation by allowing agents to:

* **Monetize Expertise:** Sell premium capabilities, such as high-fidelity neural voice synthesis, via instant on-chain micropayments.
* **Achieve Autonomy:** Utilize earned capital to autonomously purchase API credits and computational resources.
* **Reduce Friction:** Eliminate the need for traditional user accounts, credit card registrations, and KYC processes through direct blockchain validation.

---

## Technical Stack

The architecture integrates high-performance blockchain execution with advanced AI reasoning:

* **Blockchain:** Rust and Anchor Framework on Solana for high-throughput, low-cost transaction processing.
* **Backend Orchestration:** Spring Boot (Java) for robust API management, security, and service coordination.
* **Frontend:** React, Next.js, and TailwindCSS for the user interface and dashboard.
* **Web3 Integration:** TypeScript for secure communication between the client and the Solana network.
* **AI Services:** Grok for cognitive reasoning and ElevenLabs for neural voice synthesis.

---

## Operational Workflow (X402 Protocol)

1. **Service Request:** A user or external system requests a premium service from the agent.
2. **Payment Challenge:** The agent identifies the resource cost and triggers an HTTP 402 (Payment Required) status.
3. **Transaction Execution:** The user signs a micro-transaction on the Solana network via a digital wallet.
4. **On-Chain Verification:** The Spring Boot backend validates the transaction signature against the Solana ledger in real-time.
5. **Autonomous Delivery:** Upon confirmation, the agent receives the funds, acquires the necessary external resources, and delivers the final output.

---

## Project Structure

```
├── anchor-program/    # Smart Contracts (Rust/Anchor)
├── backend-spring/    # API and Orchestration (Spring Boot)
├── frontend-next/     # User Dashboard (Next.js)
└── documentation/     # Technical specifications and assets
```

---

##Installation and Deployment
**Prerequisites:** 
* Rust and Cargo
* Solana CLI
* Anchor Framework
* JDK 17 or higher
* Node.js v18 or higher

---

##Deployment Steps
1. **Repository Initialization:**

### Deployment Steps

1. **Repository Initialization:**

	```
	git clone [https://github.com/repository-url/chAIn.git](https://github.com/repository-url/chAIn.git)
	cd chAIn
	```

2. **Smart Contract Deployment:**
	```
	cd anchor-program
	anchor build && anchor deploy
	```
3. **Backend Configuration:**
	```
	cd ../backend-spring
	./mvnw spring-boot:run
	```
4. **Frontend Implementation:**
	```
	cd ../frontend-next
	npm install && npm run dev
	```
