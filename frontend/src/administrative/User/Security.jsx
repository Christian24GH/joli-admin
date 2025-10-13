import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Smartphone, 
  Clock, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Copy, 
  Download, 
  Trash2,
  Monitor,
  MapPin,
  Wifi,
  RefreshCw
} from "lucide-react";

export default function Security() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [backupCodesShown, setBackupCodesShown] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    passwordlessLogin: false,
    biometricLogin: false,
    sessionTimeout: 30,
    requirePasswordFor: {
      sensitiveActions: true,
      accountChanges: true,
      paymentActions: true
    }
  });

  // Mock data for active sessions
  const [activeSessions] = useState([
    {
      id: 1,
      device: "MacBook Pro",
      browser: "Chrome 118",
      location: "San Francisco, CA",
      ip: "192.168.1.100",
      lastActive: "2 minutes ago",
      current: true,
      trusted: true
    },
    {
      id: 2,
      device: "iPhone 14 Pro",
      browser: "Safari Mobile",
      location: "San Francisco, CA",
      ip: "192.168.1.101",
      lastActive: "1 hour ago",
      current: false,
      trusted: true
    },
    {
      id: 3,
      device: "Windows Desktop",
      browser: "Edge 119",
      location: "New York, NY",
      ip: "203.0.113.42",
      lastActive: "3 days ago",
      current: false,
      trusted: false
    }
  ]);

  // Mock backup codes
  const backupCodes = [
    "A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", 
    "M3N4-O5P6", "Q7R8-S9T0", "U1V2-W3X4",
    "Y5Z6-A7B8", "C9D0-E1F2"
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (password) => {
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const handleTerminateSession = (sessionId) => {
    alert(`Session ${sessionId} terminated successfully.`);
  };

  const handleTerminateAllSessions = () => {
    alert("All other sessions have been terminated.");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Password Protected</p>
                <p className="text-xs text-green-600">Strong password set</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">2FA Recommended</p>
                <p className="text-xs text-orange-600">Enable for extra security</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">3 Active Sessions</p>
                <p className="text-xs text-blue-600">Manage your devices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Last password change: 45 days ago. Consider updating your password regularly.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter new password"
              />
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={passwordStrength} 
                      className={`flex-1 h-2 ${getPasswordStrengthColor(passwordStrength)}`}
                    />
                    <span className="text-sm font-medium">
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p className={newPassword.length >= 8 ? "text-green-600" : ""}>
                      ✓ At least 8 characters
                    </p>
                    <p className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
                      ✓ Mixed case letters
                    </p>
                    <p className={/\d/.test(newPassword) ? "text-green-600" : ""}>
                      ✓ Numbers
                    </p>
                    <p className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : ""}>
                      ✓ Special characters
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {confirmPassword && (
                <p className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-600"}`}>
                  {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}
            </div>

            <Button className="w-full" disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
            {twoFactorEnabled && <Badge className="bg-green-100 text-green-800">Enabled</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Authenticator App</h4>
                {twoFactorEnabled && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
              <p className="text-sm text-slate-600">
                Use an authenticator app to generate time-based codes
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Two-factor authentication is active. Your account is protected with an extra layer of security.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Backup Codes</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBackupCodesShown(!backupCodesShown)}
                    >
                      {backupCodesShown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {backupCodesShown ? "Hide" : "Show"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Use these codes if you can't access your authenticator app. Each code can only be used once.
                </p>

                {backupCodesShown && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 bg-slate-50 rounded-lg">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                        <code className="text-sm font-mono">{code}</code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                          className="p-1 h-auto"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Backup Codes
                </Button>
              </div>
            </div>
          )}

          {!twoFactorEnabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                Enable two-factor authentication to add an extra layer of security to your account.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Notifications</Label>
                <p className="text-sm text-slate-500">Get notified when someone signs into your account</p>
              </div>
              <Switch
                checked={securitySettings.loginNotifications}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, loginNotifications: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Suspicious Activity Alerts</Label>
                <p className="text-sm text-slate-500">Get alerted about unusual account activity</p>
              </div>
              <Switch
                checked={securitySettings.suspiciousActivityAlerts}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, suspiciousActivityAlerts: checked}))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Passwordless Login</Label>
                <p className="text-sm text-slate-500">Use biometrics or security keys instead of passwords</p>
              </div>
              <Switch
                checked={securitySettings.passwordlessLogin}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({...prev, passwordlessLogin: checked}))
                }
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Require Password For</Label>
              <div className="space-y-3 ml-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sensitive actions</span>
                  <Switch
                    checked={securitySettings.requirePasswordFor.sensitiveActions}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev, 
                        requirePasswordFor: {...prev.requirePasswordFor, sensitiveActions: checked}
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account changes</span>
                  <Switch
                    checked={securitySettings.requirePasswordFor.accountChanges}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev, 
                        requirePasswordFor: {...prev.requirePasswordFor, accountChanges: checked}
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment actions</span>
                  <Switch
                    checked={securitySettings.requirePasswordFor.paymentActions}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({
                        ...prev, 
                        requirePasswordFor: {...prev.requirePasswordFor, paymentActions: checked}
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Sessions
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleTerminateAllSessions}>
              Terminate All Others
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{session.device}</h4>
                      {session.current && <Badge variant="secondary">Current</Badge>}
                      {session.trusted && <Badge className="bg-green-100 text-green-800">Trusted</Badge>}
                    </div>
                    <p className="text-sm text-slate-600">{session.browser}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        {session.ip}
                      </span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Security Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Successful login</p>
                <p className="text-xs text-green-600">2 minutes ago • Chrome on MacBook Pro</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">Login from new location</p>
                <p className="text-xs text-orange-600">3 days ago • Edge on Windows • New York, NY</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Key className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Password updated</p>
                <p className="text-xs text-blue-600">45 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Security Settings</Button>
      </div>
    </div>
  );
}