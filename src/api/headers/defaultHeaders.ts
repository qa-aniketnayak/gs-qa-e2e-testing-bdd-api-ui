export class DefaultHeaders {
  static get(): Record<string, string> {
    return {
      Cookie: [
        'application_id=199',
        'application_revision=167',
        'customer_reference=153',
        'customer_state=NY',
        'gs_program=VSC',
        'provider_reference=4'
      ].join('; '),
      'Content-Type': 'application/json'
    };
  }
}
