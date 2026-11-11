import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { CheckboxGroup } from "../../components/CheckboxGroup";
import { DateTimeField } from "../../components/DateTimeField";
import { LocationField } from "../../components/LocationField";
import { PartsTable } from "../../components/PartsTable";
import { Row, Section } from "../../components/Section";
import { SignatureField } from "../../components/SignatureField";
import { TextField } from "../../components/TextField";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { sendReportEmail } from "@/service/email";
import { generateReportPdf, sharePdf } from "@/service/pdf";
import { useReportStore } from "../../store/reportStore";
import { theme } from "../../theme";
import { Report, SERVICE_TYPES, Signatory } from "../../types/report";
import { buildRecipients } from "../../utils/email";
import { validateReport } from "../../utils/validation";

type RepKey = "navaltRep" | "customerRep";

export function ReportForm({ report }: { report: Report }) {
  const updateReport = useReportStore((s) => s.updateReport);
  const online = useNetworkStatus();

  const [draft, setDraft] = useState<Report>(report);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState<"email" | "share" | null>(null);

  const dirty = useRef(false);
  const latest = useRef(draft);
  latest.current = draft;

  const persist = useCallback(
    (r: Report) => updateReport(r.id, r),
    [updateReport],
  );

  const update = useCallback(
    <K extends keyof Report>(key: K, value: Report[K]) => {
      dirty.current = true;
      setDraft((d) => ({ ...d, [key]: value, status: "draft" }));
    },
    [],
  );

  // Auto-save: debounce while typing, and flush when leaving the screen.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => {
      persist(latest.current);
      dirty.current = false;
    }, 500);
    return () => clearTimeout(t);
  }, [draft, persist]);
  useEffect(
    () => () => {
      if (dirty.current) persist(latest.current);
    },
    [persist],
  );

  const errors = useMemo(
    () => (attempted ? validateReport(draft) : {}),
    [attempted, draft],
  );

  const updateRep = (key: RepKey, patch: Partial<Signatory>) =>
    update(key, { ...draft[key], ...patch });
  const onSign = (key: RepKey, sig: string | null) =>
    updateRep(key, {
      signature: sig,
      date:
        sig && !draft[key].date ? new Date().toISOString() : draft[key].date,
    });

  /** Validate, build the PDF, store it on the report. Returns null if validation fails. */
  const prepare = async (): Promise<Report | null> => {
    setAttempted(true);
    if (Object.keys(validateReport(latest.current)).length > 0) {
      Alert.alert(
        "Report incomplete",
        "Please fill the highlighted fields and signatures.",
      );
      return null;
    }
    const pdfUri = await generateReportPdf(latest.current);
    const next: Report = { ...latest.current, pdfUri, status: "completed" };
    dirty.current = false;
    setDraft(next);
    persist(next);
    return next;
  };

  const run = async (kind: "email" | "share") => {
    setBusy(kind);
    try {
      const ready = await prepare();
      if (!ready?.pdfUri) return;

      if (kind === "share") {
        await sharePdf(ready.pdfUri);
        return;
      }
      const result = await sendReportEmail(ready);
      if (result === "unavailable") {
        Alert.alert(
          "No mail app found",
          "No mail account is set up on this phone. Share the PDF instead?",
          [
            { text: "Share PDF", onPress: () => sharePdf(ready.pdfUri!) },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else if (result === "sent") {
        const done: Report = { ...ready, status: "emailed" };
        setDraft(done);
        persist(done);
      }
    } catch (e) {
      Alert.alert(
        "Something went wrong",
        e instanceof Error ? e.message : String(e),
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Job details">
          <CheckboxGroup
            options={SERVICE_TYPES}
            value={draft.serviceTypes}
            onChange={(v) => update("serviceTypes", v)}
            error={errors.serviceTypes}
          />
          <TextField
            label="FSR No."
            required
            value={draft.fsrNo}
            onChangeText={(v) => update("fsrNo", v)}
            error={errors.fsrNo}
          />
          <TextField
            label="Project Name/No."
            required
            value={draft.projectName}
            onChangeText={(v) => update("projectName", v)}
            error={errors.projectName}
          />
          <TextField
            label="Customer/Site Address"
            required
            multiline
            value={draft.siteAddress}
            onChangeText={(v) => update("siteAddress", v)}
            error={errors.siteAddress}
          />
          <Row>
            <TextField
              label="Contact Name"
              required
              value={draft.contactName}
              onChangeText={(v) => update("contactName", v)}
              error={errors.contactName}
            />
            <TextField
              label="Contact Number"
              required
              keyboardType="phone-pad"
              value={draft.contactNumber}
              onChangeText={(v) => update("contactNumber", v)}
              error={errors.contactNumber}
            />
          </Row>
          <Row>
            <DateTimeField
              label="Complaint Date"
              mode="date"
              value={draft.complaintDate}
              onChange={(v) => update("complaintDate", v)}
            />
            <DateTimeField
              label="Attended Date"
              mode="date"
              required
              value={draft.attendedDate}
              onChange={(v) => update("attendedDate", v)}
              error={errors.attendedDate}
            />
          </Row>
          <Row>
            <DateTimeField
              label="Start Time"
              mode="time"
              value={draft.startTime}
              onChange={(v) => update("startTime", v)}
            />
            <DateTimeField
              label="Finish Time"
              mode="time"
              value={draft.finishTime}
              onChange={(v) => update("finishTime", v)}
            />
          </Row>
        </Section>

        <Section title="Site location">
          <LocationField
            value={draft.location}
            onChange={(p) => update("location", p)}
          />
        </Section>

        <Section title="Customer complaint">
          <TextField
            label="Customer Complaint"
            required
            multiline
            value={draft.customerComplaint}
            onChangeText={(v) => update("customerComplaint", v)}
            error={errors.customerComplaint}
          />
        </Section>

        <Section title="Observation">
          <TextField
            label="Observation"
            multiline
            value={draft.observation}
            onChangeText={(v) => update("observation", v)}
          />
        </Section>

        <Section title="Failed parts">
          <PartsTable
            rows={draft.parts}
            onChange={(rows) => update("parts", rows)}
          />
        </Section>

        <Section title="Recommendations and remarks">
          <TextField
            label="Recommendations"
            multiline
            value={draft.recommendations}
            onChangeText={(v) => update("recommendations", v)}
          />
          <TextField
            label="Customer Remarks"
            multiline
            value={draft.customerRemarks}
            onChangeText={(v) => update("customerRemarks", v)}
          />
        </Section>

        <Section title="Authorization">
          <Text style={styles.sub}>Navalt representative</Text>
          <Row>
            <TextField
              label="Name"
              required
              value={draft.navaltRep.name}
              onChangeText={(v) => updateRep("navaltRep", { name: v })}
              error={errors.navaltRepName}
            />
            <TextField
              label="Designation"
              value={draft.navaltRep.designation}
              onChangeText={(v) => updateRep("navaltRep", { designation: v })}
            />
          </Row>
          <Row>
            <SignatureField
              label="Sign"
              value={draft.navaltRep.signature}
              onChange={(s) => onSign("navaltRep", s)}
              error={errors.navaltRepSignature}
            />
            <DateTimeField
              label="Date"
              mode="date"
              value={draft.navaltRep.date}
              onChange={(v) => updateRep("navaltRep", { date: v })}
            />
          </Row>

          <Text style={[styles.sub, { marginTop: theme.spacing.md }]}>
            Customer representative
          </Text>
          <Row>
            <TextField
              label="Name"
              required
              value={draft.customerRep.name}
              onChangeText={(v) => updateRep("customerRep", { name: v })}
              error={errors.customerRepName}
            />
            <TextField
              label="Designation"
              value={draft.customerRep.designation}
              onChangeText={(v) => updateRep("customerRep", { designation: v })}
            />
          </Row>
          <Row>
            <SignatureField
              label="Sign"
              value={draft.customerRep.signature}
              onChange={(s) => onSign("customerRep", s)}
              error={errors.customerRepSignature}
            />
            <DateTimeField
              label="Date"
              mode="date"
              value={draft.customerRep.date}
              onChange={(v) => updateRep("customerRep", { date: v })}
            />
          </Row>
        </Section>

        <Section title="Send report">
          <TextField
            label="Client email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="client@example.com"
            value={draft.clientEmail}
            onChangeText={(v) => update("clientEmail", v)}
            error={errors.clientEmail}
            hint="Separate several addresses with commas."
          />
          <Text style={styles.recipients}>
            Will be sent to: {buildRecipients(draft).join(", ")}
          </Text>
          {!online ? (
            <Text style={styles.recipients}>
              You are offline. The PDF is still created on this phone, and your
              mail app sends the email once you are back online.
            </Text>
          ) : null}
          <Button
            title="Generate PDF and email"
            icon="mail-outline"
            loading={busy === "email"}
            disabled={busy !== null}
            onPress={() => run("email")}
          />
          <Button
            title="Share PDF"
            icon="share-outline"
            variant="outline"
            loading={busy === "share"}
            disabled={busy !== null}
            onPress={() => run("share")}
          />
        </Section>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl * 2 },
  sub: { ...theme.typography.label, color: theme.colors.textMuted },
  recipients: { ...theme.typography.caption, color: theme.colors.textMuted },
});
