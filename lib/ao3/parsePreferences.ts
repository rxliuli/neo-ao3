export interface PreferenceField {
  name: string
  label: string
  type: 'checkbox' | 'select'
  value: boolean | string
  options?: { value: string; label: string }[]
}

export interface PreferenceSection {
  legend: string
  fields: PreferenceField[]
}

export interface UserPreferences {
  sections: PreferenceSection[]
  authenticityToken: string
  formAction: string
}

export function parsePreferences(doc: Document): UserPreferences {
  const form = doc.querySelector('form.edit_preference')
  const authenticityToken =
    form?.querySelector<HTMLInputElement>(
      'input[name="authenticity_token"]',
    )?.value ?? ''
  const formAction = form?.getAttribute('action') ?? ''

  const sections: PreferenceSection[] = []

  if (!form) return { sections, authenticityToken, formAction }

  for (const fieldset of form.querySelectorAll('fieldset')) {
    const legend = fieldset.querySelector('legend')?.textContent?.trim() ?? ''
    const fields: PreferenceField[] = []

    for (const dd of fieldset.querySelectorAll('dd')) {
      const checkbox = dd.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )
      const select = dd.querySelector<HTMLSelectElement>('select')

      if (checkbox) {
        const id = checkbox.id
        const label =
          fieldset
            .querySelector<HTMLLabelElement>(`label[for="${id}"]`)
            ?.textContent?.trim() ?? ''
        const name = checkbox.name
        fields.push({
          name,
          label,
          type: 'checkbox',
          value: checkbox.hasAttribute('checked'),
        })
      } else if (select) {
        const id = select.id
        const label =
          fieldset
            .querySelector<HTMLLabelElement>(`label[for="${id}"]`)
            ?.textContent?.trim() ?? ''
        const name = select.name
        const options = Array.from(select.querySelectorAll('option')).map(
          (opt) => ({
            value: opt.getAttribute('value') ?? '',
            label: opt.textContent?.trim() ?? '',
          }),
        )
        const selectedOpt = select.querySelector('option[selected]')
        const value = selectedOpt?.getAttribute('value') ?? options[0]?.value ?? ''
        fields.push({
          name,
          label,
          type: 'select',
          value,
          options,
        })
      }
    }

    if (fields.length > 0) {
      sections.push({ legend, fields })
    }
  }

  return { sections, authenticityToken, formAction }
}
