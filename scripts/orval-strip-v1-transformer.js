export default function stripV1PathPrefix(spec) {
  if (!spec.paths) {
    return spec;
  }

  return {
    ...spec,
    paths: Object.fromEntries(
      Object.entries(spec.paths).map(([path, config]) => [
        path.startsWith('/v1/') ? path.replace(/^\/v1/, '') : path,
        config,
      ]),
    ),
  };
}
