import { getBrand, type Lang } from './brand'

type Dict = Record<string, string>

const DE: Dict = {
  // common
  back: 'Zurück',
  continue: 'Weiter',
  unknownError: 'Unbekannter Fehler',
  poweredBy: 'Powerd by Eggselence',
  api_dob_mismatch: 'Geburtsdatum stimmt nicht überein.',
  api_no_policy: 'Keine aktive Police zu dieser Kreditkarte gefunden.',
  api_search_failed: 'Fehler bei der Policesuche.',
  api_create_failed: 'Fehler beim Anlegen des Schadensfalls.',
  api_upload_failed: 'Fehler beim Hochladen von "{name}".',

  // start
  start_h1: 'Schaden melden',
  start_subtitle: 'Melden Sie Ihren Reiseschaden schnell und einfach online. Halten Sie Ihre Kreditkarte und Ihren Personalausweis bereit.',
  start_card_title: 'Online Schadensmeldung',
  start_card_body: 'Reichen Sie Ihren Schadensfall direkt online ein. Sie benötigen dafür Ihre Kreditkartennummer und Ihr Geburtsdatum.',
  start_cta: 'Schaden melden',
  start_notice_label: 'Hinweis:',
  start_notice_emergency: 'Bei einem Notfall im Ausland wenden Sie sich bitte direkt an unsere 24h-Notfallhotline:',

  // search
  search_h1: 'Police suchen',
  search_subtitle: 'Bitte geben Sie Ihre Kreditkartendaten ein, um Ihre Police zu finden.',
  search_dob_label: 'Geburtsdatum',
  search_dob_hint: 'Zur Verifikation Ihrer Identität.',
  search_loading: 'Suche läuft…',

  // credit card
  cc_label: 'Kreditkartennummer',
  cc_aria_first6: 'Erste 6 Stellen',
  cc_aria_last4: 'Letzte 4 Stellen',
  cc_hint: 'Hinweis: Bitte geben Sie nur die ersten 6 und die letzten 4 Stellen der Kreditkartennummer an.',

  // questionnaire — steps
  step_reise: 'Reisedaten',
  step_medizin: 'Medizin',
  step_bank: 'Bankverbindung',
  cardholder: 'Karteninhaber',

  // step 1
  q1_h1: 'Reisedaten & Schadensdetails',
  q1_incident_date: 'Schadensdatum *',
  q1_description: 'Schadensbeschreibung *',
  q1_description_placeholder: 'Was ist passiert?',
  q1_departure: 'Ausreise aus {country} am *',
  q1_purpose: 'Reisegrund *',
  q1_purpose_leisure: 'Urlaubsreise',
  q1_purpose_business: 'Dienstreise',
  q1_country: 'Reiseland *',
  q1_country_placeholder: 'z. B. Spanien',
  q1_payment: 'Zahlungsweise *',
  q1_payment_hint: 'Wie wurden die Rechnungen bezahlt?',
  q1_payment_cash: 'Bar',
  q1_payment_card: 'Kreditkarte',
  q1_payment_other: 'Andere',
  q1_currency: 'Währung *',
  q1_currency_hint: 'In welcher Währung wurden die Rechnungen beglichen?',
  q1_currency_placeholder: 'z. B. EUR',

  // step 2
  q2_h1: 'Medizinische Angaben',
  q2_yes: 'Ja',
  q2_no: 'Nein',
  q2_accident: 'Handelt es sich um die Folgen eines Unfalls? *',
  q2_third_party: 'Liegt ein Fremdverschulden vor? *',
  q2_pre_existing: 'Bestand die Erkrankung bereits vor Reiseantritt? *',
  q2_pre_existing_hint: 'Falls ja, bitte ärztliche Atteste der letzten 6 Monate vor Reiseantritt beifügen.',
  q2_health_insurance: 'Ist die erkrankte Person in einer gesetzlichen oder privaten Krankenversicherung? *',
  q2_kv_name: 'Name der Versicherung',
  q2_kv_address: 'Anschrift der Versicherung',
  q2_kv_number: 'Versicherungsnummer',
  q2_other_insurance: 'Besteht eine weitere Krankenversicherung mit Auslandsreiseschutz? *',

  // step 3
  q3_h1: 'Bankverbindung',
  q3_subtitle: 'Geben Sie die Bankverbindung an, auf die die Versicherungsleistung ausgezahlt werden soll.',
  q3_iban: 'IBAN *',
  q3_iban_loading: 'Bankdaten werden gesucht…',
  q3_iban_found: 'Bank gefunden – Felder automatisch ausgefüllt.',
  q3_iban_invalid: 'IBAN konnte nicht validiert werden. Bitte prüfen Sie die Eingabe.',
  q3_bic: 'BIC',
  q3_bic_hint: 'Nur bei ausländischen Konten erforderlich.',
  q3_bank_name: 'Name, Postleitzahl, Ort des Geldinstituts *',
  q3_account_holder: 'Kontoinhaber *',
  q3_disclaimer: 'Vorstehende Angaben sind wahrheitsgemäß und nach bestem Wissen erfolgt. Mir ist bekannt, dass unwahre Angaben zum Verlust des Versicherungsanspruchs führen können.',
  q3_submit: 'Antrag einreichen',
  q3_submitting: 'Wird eingereicht…',
  q3_no_person: 'Keine Personennummer für den Karteninhaber gefunden.',

  // upload
  upload_h1: 'Dokumente hochladen',
  upload_subtitle: 'Laden Sie unterstützende Dokumente hoch (z. B. Arztberichte, Quittungen, Fotos).',
  upload_waiting: 'Schadensfall wird verarbeitet, bitte warten…',
  upload_pick: 'Dateien auswählen',
  upload_pick_hint: 'PDF, JPG, PNG — max. 10 MB pro Datei',
  upload_remove: 'Entfernen',
  upload_skip: 'Überspringen',
  upload_uploading: 'Hochladen…',
  upload_error: 'Fehler beim Hochladen.',

  // confirmation
  conf_step_submitted: 'Schadensfall eingereicht',
  conf_step_analysed: 'Dokumente analysiert',
  conf_step_invoiced: 'Abrechnung erstellt',
  conf_h1_done: 'Schaden erfolgreich bearbeitet',
  conf_h1_processing: 'Schadensfall wird bearbeitet',
  conf_body_done: 'Ihr Schadensfall wurde abgeschlossen. Sie erhalten eine Bestätigung per E-Mail.',
  conf_body_processing: 'Ihre Unterlagen werden geprüft. Dies kann einige Minuten dauern.',
  conf_reference: 'Referenz:',
  conf_summary: 'Zusammenfassung',
  conf_invoice_prefix: 'Rechnung – ',
  conf_position: 'Position',
  conf_total: 'Total',
  conf_back_home: 'Zur Startseite',
}

const EN: Dict = {
  back: 'Back',
  continue: 'Continue',
  unknownError: 'Unknown error',
  poweredBy: 'Powered by Eggselence',
  api_dob_mismatch: 'Date of birth does not match.',
  api_no_policy: 'No active policy found for this credit card.',
  api_search_failed: 'Policy lookup failed.',
  api_create_failed: 'Could not create the claim.',
  api_upload_failed: 'Failed to upload "{name}".',

  start_h1: 'File a claim',
  start_subtitle: 'Submit your travel insurance claim quickly and easily online. Have your credit card and ID document ready.',
  start_card_title: 'Online claim submission',
  start_card_body: 'Submit your claim directly online. You will need your credit card number and your date of birth.',
  start_cta: 'File a claim',
  start_notice_label: 'Note:',
  start_notice_emergency: 'For emergencies abroad, please contact our 24h Customer Care Centre directly:',

  search_h1: 'Find your policy',
  search_subtitle: 'Please enter your credit card details to locate your policy.',
  search_dob_label: 'Date of birth',
  search_dob_hint: 'For identity verification.',
  search_loading: 'Searching…',

  cc_label: 'Credit card number',
  cc_aria_first6: 'First 6 digits',
  cc_aria_last4: 'Last 4 digits',
  cc_hint: 'Note: please enter only the first 6 and last 4 digits of your credit card number.',

  step_reise: 'Trip',
  step_medizin: 'Medical',
  step_bank: 'Bank details',
  cardholder: 'Cardholder',

  q1_h1: 'Trip & incident details',
  q1_incident_date: 'Date of incident *',
  q1_description: 'Description of incident *',
  q1_description_placeholder: 'What happened?',
  q1_departure: 'Departure from {country} on *',
  q1_purpose: 'Purpose of trip *',
  q1_purpose_leisure: 'Leisure',
  q1_purpose_business: 'Business',
  q1_country: 'Destination country *',
  q1_country_placeholder: 'e.g. Spain',
  q1_payment: 'Payment method *',
  q1_payment_hint: 'How were the bills paid?',
  q1_payment_cash: 'Cash',
  q1_payment_card: 'Credit card',
  q1_payment_other: 'Other',
  q1_currency: 'Currency *',
  q1_currency_hint: 'In which currency were the bills paid?',
  q1_currency_placeholder: 'e.g. ZAR',

  q2_h1: 'Medical information',
  q2_yes: 'Yes',
  q2_no: 'No',
  q2_accident: 'Is this a result of an accident? *',
  q2_third_party: 'Was a third party at fault? *',
  q2_pre_existing: 'Did the condition exist before the trip began? *',
  q2_pre_existing_hint: 'If yes, please attach medical certificates from the 6 months before the trip.',
  q2_health_insurance: 'Is the affected person covered by a health insurance plan? *',
  q2_kv_name: 'Name of insurer',
  q2_kv_address: 'Address of insurer',
  q2_kv_number: 'Policy number',
  q2_other_insurance: 'Is there additional health insurance with overseas travel cover? *',

  q3_h1: 'Bank details',
  q3_subtitle: 'Please provide the bank account where the claim payout should be deposited.',
  q3_iban: 'Account number *',
  q3_iban_loading: 'Looking up bank details…',
  q3_iban_found: 'Bank found — fields filled in automatically.',
  q3_iban_invalid: 'Account number could not be verified. Please check your input.',
  q3_bic: 'SWIFT / BIC',
  q3_bic_hint: 'Only required for foreign accounts.',
  q3_bank_name: 'Bank name, branch, city *',
  q3_account_holder: 'Account holder *',
  q3_disclaimer: 'The information above is true and given to the best of my knowledge. I understand that false statements may result in loss of cover.',
  q3_submit: 'Submit claim',
  q3_submitting: 'Submitting…',
  q3_no_person: 'No person record found for the cardholder.',

  upload_h1: 'Upload documents',
  upload_subtitle: 'Upload supporting documents (e.g. medical reports, receipts, photos).',
  upload_waiting: 'Processing your claim, please wait…',
  upload_pick: 'Select files',
  upload_pick_hint: 'PDF, JPG, PNG — max. 10 MB per file',
  upload_remove: 'Remove',
  upload_skip: 'Skip',
  upload_uploading: 'Uploading…',
  upload_error: 'Upload failed.',

  conf_step_submitted: 'Claim submitted',
  conf_step_analysed: 'Documents analysed',
  conf_step_invoiced: 'Settlement prepared',
  conf_h1_done: 'Claim processed successfully',
  conf_h1_processing: 'Claim is being processed',
  conf_body_done: 'Your claim has been finalised. You will receive a confirmation by email.',
  conf_body_processing: 'Your documents are being reviewed. This may take a few minutes.',
  conf_reference: 'Reference:',
  conf_summary: 'Summary',
  conf_invoice_prefix: 'Invoice – ',
  conf_position: 'Item',
  conf_total: 'Total',
  conf_back_home: 'Back to home',
}

const DICTS: Record<Lang, Dict> = { de: DE, en: EN }

export function t(key: keyof typeof DE, vars?: Record<string, string>): string {
  const lang = getBrand().lang
  let s = DICTS[lang][key] ?? DE[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(v)
    }
  }
  return s
}

export function getLang(): Lang {
  return getBrand().lang
}
