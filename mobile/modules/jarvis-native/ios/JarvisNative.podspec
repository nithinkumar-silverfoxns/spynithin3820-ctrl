Pod::Spec.new do |s|
  s.name           = 'JarvisNative'
  s.version        = '0.1.0'
  s.summary        = 'SILVERFOXNS JARVIS native device actions'
  s.description    = 'Torch, battery, reminders/calendar and app-launch for JARVIS, within Apple APIs.'
  s.author         = 'Silverfoxns'
  s.homepage       = 'https://github.com/nithinkumar-silverfoxns/spynithin3820-ctrl'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
