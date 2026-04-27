import { defineRelations } from "drizzle-orm"
import { index, primaryKey } from "drizzle-orm/pg-core"

import { createTable } from "./utils/table.js"

// ============================================================================
// BETTER AUTH TABLES
// ============================================================================

export const users = createTable("users", t => ({
	id: t.text("id").primaryKey(),
	name: t.text("name").notNull(),
	email: t.text("email").notNull().unique(),
	emailVerified: t.boolean("email_verified").default(false).notNull(),
	image: t.text("image"),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const sessions = createTable("sessions", t => ({
	id: t.text("id").primaryKey(),
	token: t.text("token").notNull().unique(),
	userId: t.text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	expiresAt: t.timestamp("expires_at").notNull(),
	ipAddress: t.text("ip_address"),
	userAgent: t.text("user_agent"),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const accounts = createTable(
	"accounts",
	t => ({
		id: t.text("id"),
		accountId: t.text("account_id").notNull(),
		providerId: t.text("provider_id").notNull(),
		userId: t.text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		accessToken: t.text("access_token"),
		refreshToken: t.text("refresh_token"),
		idToken: t.text("id_token"),
		accessTokenExpiresAt: t.timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at"),
		scope: t.text("scope"),
		password: t.text("password"),
		createdAt: t.timestamp("created_at").notNull().defaultNow(),
		updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
	}),
	t => [
		primaryKey({ columns: [t.providerId, t.accountId] }),
		index("account_user_id_idx").on(t.userId),
	]
)

export const verifications = createTable(
	"verifications",
	t => ({
		id: t.text("id"),
		identifier: t.text("identifier").notNull(),
		value: t.text("value").notNull(),
		expiresAt: t.timestamp("expires_at").notNull(),
		createdAt: t.timestamp("created_at").defaultNow(),
		updatedAt: t.timestamp("updated_at").defaultNow(),
	}),
	t => [primaryKey({ columns: [t.identifier, t.value] })]
)

// ============================================================================
// SLMC — STAFF PROFILES
// ============================================================================

export const staffProfiles = createTable("staff_profiles", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	userId: t.text("user_id").references(() => users.id, { onDelete: "cascade" }),
	role: t.text("role").notNull().default("case_manager")
		.$type<"admin" | "case_manager" | "clinical_staff" | "supervisor" | "reports_viewer">(),
	department: t.text("department").default(""),
	employeeId: t.text("employee_id").default(""),
	isActive: t.boolean("is_active").default(true),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — PATIENTS
// ============================================================================

export const patients = createTable("patients", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	patientNo: t.text("patient_no").notNull().unique(),
	fullName: t.text("full_name").notNull(),
	dateOfBirth: t.text("date_of_birth").default(""),
	gender: t.text("gender").default("").$type<"male" | "female" | "other" | "">(),
	contactEmail: t.text("contact_email").default(""),
	contactPhone: t.text("contact_phone").default(""),
	address: t.text("address").default(""),
	hmoProvider: t.text("hmo_provider").default(""),
	insurancePolicy: t.text("insurance_policy").default(""),
	bloodType: t.text("blood_type").default(""),
	allergies: t.text("allergies").default(""),
	isActive: t.boolean("is_active").default(true),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — ENTITLEMENTS (HMO / Insurance / Care Plans)
// ============================================================================

export const entitlements = createTable("entitlements", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	patientId: t.text("patient_id").references(() => patients.id, { onDelete: "cascade" }),
	type: t.text("type").default("hmo").$type<"hmo" | "insurance" | "care_plan">(),
	provider: t.text("provider").notNull(),
	policyNumber: t.text("policy_number").default(""),
	coverageDetails: t.text("coverage_details").default(""),
	validFrom: t.text("valid_from").default(""),
	validUntil: t.text("valid_until").default(""),
	status: t.text("status").default("active").$type<"active" | "expired" | "suspended">(),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — MAJOR INCIDENTS
// ============================================================================

export const majorIncidents = createTable("major_incidents", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	title: t.text("title").notNull(),
	description: t.text("description").default(""),
	status: t.text("status").default("active").$type<"active" | "monitoring" | "resolved" | "closed">(),
	severity: t.text("severity").default("medium").$type<"low" | "medium" | "high" | "critical">(),
	commanderId: t.text("commander_id").references(() => users.id, { onDelete: "set null" }),
	affectedDepartment: t.text("affected_department").default(""),
	resolvedAt: t.timestamp("resolved_at"),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — CASES
// ============================================================================

export const cases = createTable("cases", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	caseNo: t.text("case_no").notNull().unique(),
	patientId: t.text("patient_id").references(() => patients.id, { onDelete: "set null" }),
	title: t.text("title").notNull(),
	description: t.text("description").default(""),
	caseType: t.text("case_type").default("general_inquiry")
		.$type<"general_inquiry" | "complaint" | "billing" | "medical_concern" | "pharmacy" | "scheduling" | "emergency" | "feedback">(),
	priority: t.text("priority").default("medium").$type<"low" | "medium" | "high" | "critical">(),
	status: t.text("status").default("new")
		.$type<"new" | "in_progress" | "pending_patient" | "escalated" | "resolved" | "closed">(),
	channelOrigin: t.text("channel_origin").default("portal")
		.$type<"portal" | "email" | "phone" | "in_person" | "referral">(),
	department: t.text("department").default(""),
	assignedToId: t.text("assigned_to_id").references(() => users.id, { onDelete: "set null" }),
	majorIncidentId: t.text("major_incident_id").references(() => majorIncidents.id, { onDelete: "set null" }),
	slaDeadline: t.timestamp("sla_deadline"),
	resolvedAt: t.timestamp("resolved_at"),
	closedAt: t.timestamp("closed_at"),
	satisfactionRating: t.integer("satisfaction_rating"),
	satisfactionComment: t.text("satisfaction_comment").default(""),
	aiCategory: t.text("ai_category").default(""),
	aiSentiment: t.text("ai_sentiment").default("").$type<"positive" | "neutral" | "negative" | "urgent" | "">(),
	createdBy: t.text("created_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — CASE UPDATES (timeline entries)
// ============================================================================

export const caseUpdates = createTable("case_updates", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	caseId: t.text("case_id").references(() => cases.id, { onDelete: "cascade" }),
	authorId: t.text("author_id").references(() => users.id, { onDelete: "set null" }),
	content: t.text("content").notNull(),
	visibility: t.text("visibility").default("internal").$type<"internal" | "patient_facing">(),
	updateType: t.text("update_type").default("note")
		.$type<"note" | "status_change" | "assignment" | "escalation" | "patient_message" | "system">(),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — KNOWLEDGE BASE ARTICLES
// ============================================================================

export const knowledgeArticles = createTable("knowledge_articles", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	title: t.text("title").notNull(),
	content: t.text("content").notNull(),
	category: t.text("category").default("general"),
	tags: t.text("tags").default(""),
	visibility: t.text("visibility").default("internal").$type<"internal" | "patient_facing" | "both">(),
	status: t.text("status").default("draft").$type<"draft" | "published" | "archived">(),
	authorId: t.text("author_id").references(() => users.id, { onDelete: "set null" }),
	viewCount: t.integer("view_count").default(0),
	helpfulCount: t.integer("helpful_count").default(0),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// SLMC — TODOS (keep from template)
// ============================================================================

export const todos = createTable("todos", t => ({
	id: t.serial("id").primaryKey(),
	title: t.text("title").notNull(),
	completed: t.boolean("completed").notNull().default(false),
	authorId: t.text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const tickets = createTable("tickets", t => ({
	id: t.serial("id").primaryKey(),
	name: t.text("name").notNull(),
	email: t.text("email").notNull(),
	subject: t.text("subject").notNull(),
	priority: t.text("priority").notNull().default("medium").$type<"low" | "medium" | "high" | "urgent">(),
	concern: t.text("concern").notNull(),
	status: t.text("status").notNull().default("received").$type<"received" | "in_progress" | "resolved" | "closed">(),
	authorId: t.text("author_id").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// RELATIONS
// ============================================================================

export const relations = defineRelations(
	{ users, sessions, accounts, todos, tickets, staffProfiles, patients, entitlements, cases, caseUpdates, majorIncidents, knowledgeArticles },
	r => ({
		users: {
			sessions: r.many.sessions(),
			accounts: r.many.accounts(),
			staffProfile: r.many.staffProfiles(),
		},
		sessions: {
			user: r.one.users({ from: r.sessions.userId, to: r.users.id }),
		},
		accounts: {
			user: r.one.users({ from: r.accounts.userId, to: r.users.id }),
		},
		todos: {
			author: r.one.users({ from: r.todos.authorId, to: r.users.id }),
		},
		tickets: {
			author: r.one.users({ from: r.tickets.authorId, to: r.users.id }),
		},
		staffProfiles: {
			user: r.one.users({ from: r.staffProfiles.userId, to: r.users.id }),
		},
		patients: {
			entitlements: r.many.entitlements({ from: r.patients.id, to: r.entitlements.patientId }),
			cases: r.many.cases({ from: r.patients.id, to: r.cases.patientId }),
		},
		entitlements: {
			patient: r.one.patients({ from: r.entitlements.patientId, to: r.patients.id }),
		},
		cases: {
			patient: r.one.patients({ from: r.cases.patientId, to: r.patients.id }),
			assignedTo: r.one.users({ from: r.cases.assignedToId, to: r.users.id }),
			updates: r.many.caseUpdates({ from: r.cases.id, to: r.caseUpdates.caseId }),
			majorIncident: r.one.majorIncidents({ from: r.cases.majorIncidentId, to: r.majorIncidents.id }),
		},
		caseUpdates: {
			case: r.one.cases({ from: r.caseUpdates.caseId, to: r.cases.id }),
			author: r.one.users({ from: r.caseUpdates.authorId, to: r.users.id }),
		},
		majorIncidents: {
			cases: r.many.cases({ from: r.majorIncidents.id, to: r.cases.majorIncidentId }),
			commander: r.one.users({ from: r.majorIncidents.commanderId, to: r.users.id }),
		},
		knowledgeArticles: {
			author: r.one.users({ from: r.knowledgeArticles.authorId, to: r.users.id }),
		},
	})
)

// ============================================================================
// SCHEMA
// ============================================================================

export const schema = Object.assign(
	{
		users, sessions, accounts, verifications,
		todos, tickets,
		staffProfiles, patients, entitlements,
		cases, caseUpdates, majorIncidents, knowledgeArticles,
	},
	relations
)
