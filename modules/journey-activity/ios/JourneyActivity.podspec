Pod::Spec.new do |s|
  s.name           = 'JourneyActivity'
  s.version        = '1.0.0'
  s.summary        = 'Live Activity da jornada em andamento'
  s.description    = 'Inicia e encerra a Live Activity (tela de bloqueio e Dynamic Island) da jornada em andamento.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
