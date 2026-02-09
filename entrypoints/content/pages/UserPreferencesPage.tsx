import { useMemo, useState } from 'react'
import {
  parsePreferences,
  type PreferenceField,
  type PreferenceSection,
} from '@/lib/ao3/parsePreferences'
import { parseDashboardLinks } from '@/lib/ao3/parseUserProfile'
import { UserDashboardNav } from '../components/UserDashboardNav'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

function CheckboxField({
  field,
  checked,
  onChange,
}: {
  field: PreferenceField
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      <span className="text-sm">{field.label}</span>
    </label>
  )
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: PreferenceField
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5 py-1">
      <Label>{field.label}</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  )
}

function PreferenceSectionUI({
  section,
  values,
  onChange,
}: {
  section: PreferenceSection
  values: Record<string, boolean | string>
  onChange: (name: string, value: boolean | string) => void
}) {
  return (
    <fieldset className="border rounded-md p-4 space-y-2">
      <legend className="text-lg font-semibold px-2">{section.legend}</legend>
      {section.fields.map((field) => {
        if (field.type === 'checkbox') {
          return (
            <CheckboxField
              key={field.name}
              field={field}
              checked={values[field.name] as boolean}
              onChange={(checked) => onChange(field.name, checked)}
            />
          )
        }
        return (
          <SelectField
            key={field.name}
            field={field}
            value={values[field.name] as string}
            onChange={(value) => onChange(field.name, value)}
          />
        )
      })}
    </fieldset>
  )
}

export function UserPreferencesPage({ doc }: { doc: Document }) {
  const prefs = useMemo(() => parsePreferences(doc), [doc])
  const dashboardLinks = useMemo(() => parseDashboardLinks(doc), [doc])

  const [values, setValues] = useState<Record<string, boolean | string>>(() => {
    const initial: Record<string, boolean | string> = {}
    for (const section of prefs.sections) {
      for (const field of section.fields) {
        initial[field.name] = field.value
      }
    }
    return initial
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function handleChange(name: string, value: boolean | string) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setMessage(null)
  }

  async function handleSubmit() {
    setSaving(true)
    setMessage(null)

    try {
      const formData = new URLSearchParams()
      formData.set('authenticity_token', prefs.authenticityToken)
      formData.set('_method', 'put')

      for (const [name, value] of Object.entries(values)) {
        if (typeof value === 'boolean') {
          if (value) {
            formData.set(name, '1')
          }
          // Unchecked checkboxes: don't send (AO3 convention)
        } else {
          formData.set(name, value)
        }
      }

      const response = await fetch(prefs.formAction, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      })

      if (response.ok) {
        setMessage('Preferences saved successfully.')
      } else {
        setMessage('Failed to save preferences. Please try again.')
      }
    } catch {
      setMessage('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Preferences</h1>

      <UserDashboardNav links={dashboardLinks} />

      <div className="space-y-6">
        {prefs.sections.map((section) => (
          <PreferenceSectionUI
            key={section.legend}
            section={section}
            values={values}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Update'}
        </Button>
        {message && (
          <span
            className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
