#!/bin/bash
# Setup SSH agent and load SSH keys from host

# Don't exit on error for SSH key operations (they may fail if keys require passphrases)
# We'll use set +e selectively for SSH operations that may fail
set -e

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Start ssh-agent if not already running
set +e  # Don't exit on error for PID check
if [ -z "$SSH_AUTH_SOCK" ] || [ -z "$SSH_AGENT_PID" ] || ! kill -0 "$SSH_AGENT_PID" 2>/dev/null; then
    set -e  # Re-enable for ssh-agent command
    eval "$(ssh-agent -s)"
    echo "SSH agent started"
else
    set -e  # Re-enable
    echo "SSH agent already running (PID: $SSH_AGENT_PID)"
fi

# Function to add SSH key if it exists and is not already added
add_ssh_key() {
    local key_path="$1"
    if [ -f "$key_path" ] && [[ ! "$key_path" =~ \.(pub|bak)$ ]]; then
        # Check if key is already added by comparing fingerprints
        local key_fingerprint=$(ssh-keygen -lf "$key_path" 2>/dev/null | awk '{print $2}')
        if [ -n "$key_fingerprint" ]; then
            if ! ssh-add -l 2>/dev/null | grep -q "$key_fingerprint"; then
                echo "Adding SSH key: $key_path"
                # Try to add key (will prompt for passphrase if needed, but in non-interactive mode will fail silently)
                if ssh-add "$key_path" 2>/dev/null; then
                    echo "  ✓ Successfully added"
                    return 0
                else
                    echo "  ⚠ Could not add (may require passphrase - run 'ssh-add $key_path' manually)"
                    return 1
                fi
            else
                echo "SSH key already added: $key_path"
                return 0
            fi
        fi
    fi
    return 1
}

# Add common SSH key files
if [ -d ~/.ssh ] && [ "$(ls -A ~/.ssh 2>/dev/null)" ]; then
    echo ""
    echo "Looking for SSH keys in ~/.ssh..."
    # Add id_rsa, id_ed25519, id_ecdsa, id_dsa, and any other private keys
    key_count=0
    set +e  # Don't exit on error for key addition
    for key in ~/.ssh/id_*; do
        # Skip .pub files and known_hosts, authorized_keys, etc.
        if [ -f "$key" ] && [[ ! "$key" =~ \.(pub|bak)$ ]] && [[ ! "$key" =~ (known_hosts|authorized_keys|config)$ ]]; then
            add_ssh_key "$key" || true
            ((key_count++)) || true
        fi
    done
    set -e  # Re-enable exit on error
    
    if [ $key_count -eq 0 ]; then
        echo "No SSH private keys found in ~/.ssh"
    fi
    
    # List loaded keys
    echo ""
    echo "Currently loaded SSH keys:"
    set +e  # Don't exit if ssh-add -l fails
    if ssh-add -l 2>/dev/null; then
        echo ""
    else
        echo "No keys loaded in SSH agent"
    fi
    set -e
else
    echo ""
    echo "Warning: ~/.ssh directory not found or empty. SSH keys from host may not be mounted."
    echo "On Windows, make sure your docker-compose.yml mounts the SSH directory correctly."
    echo "You may need to use a full path like: C:/Users/YourUsername/.ssh:/home/node/.ssh:ro"
fi

# Make SSH agent environment variables available
echo ""
echo "SSH_AUTH_SOCK=$SSH_AUTH_SOCK"
echo "SSH_AGENT_PID=$SSH_AGENT_PID"

# Export for current session
export SSH_AUTH_SOCK
export SSH_AGENT_PID

# Save environment variables to a file for sourcing in new shells
cat > ~/.ssh-agent-env <<EOF
export SSH_AUTH_SOCK="$SSH_AUTH_SOCK"
export SSH_AGENT_PID="$SSH_AGENT_PID"
EOF

# Add to bashrc if not already present
if ! grep -q "source ~/.ssh-agent-env" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Load SSH agent environment variables" >> ~/.bashrc
    echo "if [ -f ~/.ssh-agent-env ]; then" >> ~/.bashrc
    echo "    source ~/.ssh-agent-env" >> ~/.bashrc
    echo "fi" >> ~/.bashrc
fi

# Configure Git safe directory for /workspace
echo ""
echo "Configuring Git safe directory..."
if git config --global --get-all safe.directory | grep -q "^/workspace$" 2>/dev/null; then
    echo "  ✓ /workspace already configured as safe directory"
else
    git config --global --add safe.directory /workspace
    echo "  ✓ Added /workspace as safe directory for Git"
fi
